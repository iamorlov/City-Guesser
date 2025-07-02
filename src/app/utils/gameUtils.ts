import OpenAI from 'openai';
import { Locale } from '../../i18n';

// Use the same client setup as grokClient.ts
const getGrokClient = () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true
  });
};

// Define City interface
export interface City {
  name: string;
  lat: number;
  lng: number;
}

// Define Difficulty type
export type Difficulty = 'easy' | 'medium' | 'hard';

// Language mapping for API calls
const getLanguageName = (locale: Locale): string => {
  const languageMap = {
    en: 'English',
    ru: 'Russian'
  };
  return languageMap[locale] || 'English';
};

export async function initializeGame(difficulty: Difficulty = 'medium', locale: Locale = 'en'): Promise<City> {
  try {
    const client = getGrokClient();
    const language = getLanguageName(locale);

    // Create difficulty-specific prompts
    const difficultyPrompts = {
      easy: `Create a list of 300 world capital cities (only national capitals like London, Paris, Berlin, Tokyo, Washington D.C., etc.), and randomly select one city from it. The response must be in ${language}.`,
      medium: `Create a list of 600 well-known cities from around the world, WITHOUT CAPITAL CITIES (major cities that most people would recognize like New York, Barcelona, Sydney, Prague, etc.), and randomly select one city from it. The response must be in ${language}.`,
      hard: `Create a list of 1,000 cities from ANY country in the world, including smaller cities and towns that are not necessarily well-known internationally, and randomly select one city from it. DO NOT INCLUDE CAPITAL CITIES OR VERY WELL KNOWN BIG CITIES in this list. The response must be in ${language}.`,
    };

    // Ask Grok to select a city based on difficulty
    const completion = await client.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content: `You are a geography expert selecting cities for a guessing game. You must respond ONLY in ${language}. All text in your response must be in ${language}.`
        },
        {
          role: "user",
          content: `${difficultyPrompts[difficulty]}
          The city should be appropriate for the ${difficulty} difficulty level.
          
          IMPORTANT: Respond in valid JSON format only with this exact structure:
          {"name": "CityName", "lat": latitude, "lng": longitude}
          
          The city name must be in ${language}. Do not include any additional text or explanation in your response.
          Make sure the entire response is valid JSON and the city name is properly translated to ${language}.`
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

    return cityData;
  } catch (error) {
    console.error('Error getting city from Grok:', error);
    throw new Error('Failed to initialize game. Please try again later.');
  }
}