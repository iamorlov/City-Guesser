import OpenAI from 'openai';

const getGrokClient = () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true // Required for browser usage
  });
};

export async function getHint(hintNumber: number, cityName: string): Promise<string> {
  try {
    const client = getGrokClient();
    
    // Create a prompt for Grok that asks for an appropriate hint
    const prompt = `
      You are helping with a geography guessing game. The player needs to guess the city: ${cityName}.
      
      Please provide hint #${hintNumber} about this city. 
      
      Guidelines:
      - NEVER reveal the name of the city or country directly
      - For hint 1, provide very abstract hint as possible, e.g. what continent the city is on, and also add a very obscure historical fact.
      - For hint 2, provide a less abstract hint, such as what part of the continent the city is in, e.g., Western Europe. Also add a common but little-known fact about the city
      - For hint 3, provide a hint about climate in the city, and some interesting but not very well known fact about the weather in this city, for example, the maximum temperature, or in what year there was a tornado in this city.
      - For hint 4, name a couple of not-so-famous facts about the city, like Einstein lived in this city from 1933-1934, or it was the first city to build a sewer system.
      - For hint 5, name a dish that is associated with this town. If there is no such dish, name a famous person who was born in this city.
      - For hint 6, name a relatively well-known fact about the city of your choice, but not easy enough to guess accurately.
      - For hint 7, provide a hint about the architecture or skyline of the city.
      - For hint 8, provide fairly obvious hint, you can name famous landmarks or events of this city, as well as the country where this city is located.
      - For hint 9, provide the number of characters in the name of the city.
      - For hint 10, provide the first letter of the town. If the name consists of several words. Replace the first letters of all words and the rest of the letters with *.
      - Keep hints to 1-3 sentences maximum
      - Ensure the hint is factually accurate
      - Make the hints progressively more specific
      
      Respond with ONLY the hint text, nothing else.
    `;
    
    // Call Grok API
    const completion = await client.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        { role: "system", content: "You provide geography hints that are progressively more specific but never reveal the city name directly." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    
    // Extract the hint from Grok's response
    return completion.choices[0]?.message?.content?.trim() || "No hint available";
    
  } catch (error) {
    console.error('Grok API error:', error);
    
    // Fallback to preset hints if API fails
    const sampleHints = [
      "This city is located on a continent with diverse cultures and languages.",
      "The climate here features distinct seasonal changes throughout the year.",
      "This urban area has historical significance dating back centuries.",
      "Water plays an important role in the geography of this location.",
      "The local cuisine has distinctive flavors and ingredients.",
      "Unique architectural styles define the city's skyline.",
      "The city has been featured in many famous creative works.",
      "A notable transportation system is used by locals and tourists.",
      "An iconic landmark can be seen from many points in the city.",
      "The city hosts a well-known annual event that attracts visitors."
    ];
    
    // Return a sample hint based on hint number (cycling through the array)
    return sampleHints[(hintNumber - 1) % sampleHints.length];
  }
}