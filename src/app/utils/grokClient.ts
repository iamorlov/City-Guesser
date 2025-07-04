import OpenAI from 'openai';
import { Locale } from '../../i18n';

const getGrokClient = () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true // Required for browser usage
  });
};

// Language mapping for API calls
const getLanguageName = (locale: Locale): string => {
  const languageMap = {
    en: 'English',
    ru: 'Russian',
    uk: 'Ukrainian'
  };
  return languageMap[locale] || 'English';
};

export async function getHint(hintNumber: number, cityName: string, previousHints: string[] = [], locale: Locale = 'en'): Promise<string> {
  try {
    const client = getGrokClient();
    const language = getLanguageName(locale);

    // Create a prompt for Grok that asks for an appropriate hint
    const previousHintsText = previousHints.length > 0 
      ? `\n\nPrevious hints already given:\n${previousHints.map((hint, index) => `${index + 1}. ${hint}`).join('\n')}`
      : '';

    const prompt = `
      You are helping with a geography guessing game. The player needs to guess the city: ${cityName}.
      
      Please provide hint #${hintNumber} about this city. 
      
      Guidelines:
      You must give 10 clues so that the player can guess the selected city.
      The clues must be given in order, starting with the least known facts so that it is difficult to guess the city,
      and ending with more detailed or well-known information. It can be anything: a historical fact, famous buildings,
      climate, cuisine... The main thing is to follow the rule: start with difficult clues and then move on to easier ones.
      Starting with clue #5, give specific details, such as dates, famous events, well-known people, or something else.
      For clue #9, provide the country where the city is located, as well as the number of letters in the city's name,
      and for the last clue, #10, reveal the name of the city, where a random third of the letters are replaced with the symbol "*".
      The most important thing is that all clues must be true.
      No need to number the hints in the answer.
      Also, try to make the clues interesting and detailed.
      You can give several facts in one clue, as long as they are of equal difficulty.
      
      IMPORTANT: 
      - You must respond ONLY in ${language}. 
      - All text in your response must be in ${language}.
      - Do not repeat any information from the previous hints listed below. 
      - Make sure your new hint provides completely different facts and aspects about the city.${previousHintsText}
      
      Respond with ONLY the hint text in ${language}, nothing else.
    `;

    // Call Grok API
    console.log(`Making API call to get hint #${hintNumber} for city: ${cityName}`);
    const completion = await client.chat.completions.create({
      model: "grok-3",
      messages: [
        { role: "system", content: `You provide geography hints that are progressively more specific but never reveal the city name directly. You must respond ONLY in ${language}. All text in your response must be in ${language}.` },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Extract the hint from Grok's response
    const hint = completion.choices[0]?.message?.content?.trim() || "No hint available";
    console.log(`Successfully received hint #${hintNumber} for city: ${cityName}`);
    return hint;

  } catch (error) {
    console.error('Grok API error:', error);
    throw new Error('Failed to get hint from Grok. Please try again later.');
  }
}