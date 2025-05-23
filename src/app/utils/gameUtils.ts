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
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Seoul", lat: 37.5665, lng: 126.978 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Lisbon", lat: 38.7223, lng: -9.1393 },
  { name: "Vienna", lat: 48.2082, lng: 16.3738 },
  { name: "Brussels", lat: 50.8503, lng: 4.3517 },
  { name: "Zurich", lat: 47.3769, lng: 8.5417 },
  { name: "Helsinki", lat: 60.1695, lng: 24.9354 },
  { name: "Oslo", lat: 59.9139, lng: 10.7522 },
  { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
  { name: "Copenhagen", lat: 55.6761, lng: 12.5683 },
  { name: "Dublin", lat: 53.3498, lng: -6.2603 },
  { name: "Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Warsaw", lat: 52.2297, lng: 21.0122 },
  { name: "Budapest", lat: 47.4979, lng: 19.0402 },
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
          content: `Select a well-known city from anywhere in the world for a geography guessing game.
          Respond in valid JSON format only with this exact structure:
          {"name": "CityName", "lat": latitude, "lng": longitude}
          
          The city should be internationally recognized and have a population over 500,000.
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
    
    // Parse the JSON response
    const cityData = JSON.parse(responseText) as City;
    console.log(`Selected city: ${cityData.name}`);
    
    return cityData;
  } catch (error) {
    console.error('Error getting city from Grok:', error);
    
    // Fallback to predefined list if the API call fails
    const randomIndex = Math.floor(Math.random() * fallbackCities.length);
    const fallbackCity = fallbackCities[randomIndex];
    
    console.log(`Falling back to predefined city: ${fallbackCity.name}`);
    return fallbackCity;
  }
}