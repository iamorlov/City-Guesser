import OpenAI from 'openai';
import { Locale } from '../../i18n';
import { City } from '../../types';

// Use the same client setup as grokClient.ts
const getGrokClient = () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true
  });
};

// Define Difficulty type
export type Difficulty = 'easy' | 'medium' | 'hard';

// Language mapping for API calls
const getLanguageName = (locale: Locale): string => {
  const languageMap = {
    en: 'English',
    ru: 'Russian',
    uk: 'Ukrainian'
  };
  return languageMap[locale] || 'English';
};

// SessionStorage key for used cities
const USED_CITIES_KEY = 'cityGuesser_usedCities';

// Get used cities from sessionStorage
const getUsedCities = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(USED_CITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading used cities from sessionStorage:', error);
    return [];
  }
};

// Add city to used cities in sessionStorage
const addUsedCity = (city: City): void => {
  if (typeof window === 'undefined') return;
  try {
    const usedCities = getUsedCities();
    // Use nameEn as the unique identifier to avoid language duplicates
    if (!usedCities.includes(city.nameEn)) {
      usedCities.push(city.nameEn);
      sessionStorage.setItem(USED_CITIES_KEY, JSON.stringify(usedCities));
    }
  } catch (error) {
    console.error('Error saving used city to sessionStorage:', error);
  }
};

// Get count of used cities
export const getUsedCitiesCount = (): number => {
  return getUsedCities().length;
};

// Get list of used cities (for debugging or display purposes)
export const getUsedCitiesList = (): string[] => {
  return getUsedCities();
};

// Create exclusion list prompt
const createExclusionPrompt = (usedCities: string[]): string => {
  if (usedCities.length === 0) return '';
  return `\n\nIMPORTANT: DO NOT select any of these cities that have already been used: ${usedCities.join(', ')}. Choose a different city that is NOT in this list.`;
};

export async function initializeGame(difficulty: Difficulty = 'medium', locale: Locale = 'en'): Promise<City> {
  try {
    const client = getGrokClient();
    const language = getLanguageName(locale);
    const usedCities = getUsedCities();

    // Create difficulty-specific prompts
    const difficultyPrompts = {
      easy: `Create a list of 300 world capital cities (only national capitals like London, Paris, Berlin, Tokyo, Washington D.C., etc.), and randomly select one city from it. The response must be in ${language}.`,
      medium: `Create a list of 600 well-known cities from around the world, WITHOUT CAPITAL CITIES (major cities that most people would recognize like New York, Barcelona, Sydney, Prague, etc.), and randomly select one city from it. The response must be in ${language}.`,
      hard: `Create a list of 1,000 cities from ANY country in the world, including smaller cities and towns that are not necessarily well-known internationally, and randomly select one city from it. DO NOT INCLUDE CAPITAL CITIES OR VERY WELL KNOWN BIG CITIES in this list. The response must be in ${language}.`,
    };

    // Create exclusion prompt
    const exclusionPrompt = createExclusionPrompt(usedCities);

    // Ask Grok to select a city based on difficulty
    const completion = await client.chat.completions.create({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: `You are a geography expert selecting cities for a guessing game. You must respond ONLY in ${language}. All text in your response must be in ${language}.`
        },
        {
          role: "user",
          content: `${difficultyPrompts[difficulty]}${exclusionPrompt}
          The city should be appropriate for the ${difficulty} difficulty level.
          
          IMPORTANT: Respond in valid JSON format only with this exact structure:
          {"name": "CityName", "nameEn": "CityNameInEnglish", "lat": latitude, "lng": longitude}
          
          The "name" field must be the city name in ${language}.
          The "nameEn" field must be the city name in English.
          If the selected language is English, both fields should have the same value.
          Do not include any additional text or explanation in your response.
          Make sure the entire response is valid JSON and both city names are properly provided.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from Grok');
    }

    const cityData = JSON.parse(responseText) as City;

    // Check if the returned city is in the exclusion list
    if (usedCities.includes(cityData.nameEn)) {
      console.warn('API returned a city that was supposed to be excluded. Retrying...');
      // Retry once
      return initializeGame(difficulty, locale);
    }

    // Add the new city to used cities
    addUsedCity(cityData);

    return cityData;
  } catch (error) {
    console.error('Error getting city from Grok:', error);
    throw new Error('Failed to initialize game. Please try again later.');
  }
}