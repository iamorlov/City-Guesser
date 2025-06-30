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
      You must give 10 clues so that the player can guess the selected city.
      The clues must be given in order, starting with the least known facts so that it is difficult to guess the city,
      and ending with more detailed or well-known information. It can be anything: a historical fact, famous buildings,
      climate, cuisine... The main thing is to follow the rule: start with difficult clues and then move on to easier ones.
      For clue #9, provide the country where the city is located, as well as the number of letters in the city's name,
      and for the last clue, #10, reveal the name of the city, where a random third of the letters are replaced with the symbol “*”.
      The most important thing is that all clues must be true.
      Also, try to make the clues interesting and detailed.
      You can give several facts in one clue, as long as they are of equal difficulty.
      Don't repeat hints, don't send similar facts!
      
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