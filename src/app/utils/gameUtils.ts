import OpenAI from 'openai';

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

// Fallback cities in case API fails
const fallbackCities: City[] = [
  { name: "Prague", lat: 50.0755, lng: 14.4378 },
];

export async function initializeGame(): Promise<City> {
  try {
    const client = getGrokClient();
    
    // Ask Grok to select a well-known city
    const completion = await client.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a geography expert selecting cities for a guessing game." 
        },
        { 
          role: "user", 
          content: `Create a list of 1,000 popular cities from ANY country in the world, and randomly select one city from it.
          The city should be at least somewhat well-known.
          Respond in valid JSON format only with this exact structure:
          {"name": "CityName", "lat": latitude, "lng": longitude}
          
          Do not include any additional text or explanation in your response.`
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
    
    // Fallback to predefined list if the API call fails
    const randomIndex = Math.floor(Math.random() * fallbackCities.length);
    const fallbackCity = fallbackCities[randomIndex];
    
    return fallbackCity;
  }
}