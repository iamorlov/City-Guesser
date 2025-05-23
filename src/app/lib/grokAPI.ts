// This is where we handle interactions with the Grok API

import { City } from '@/types';
import { majorCities } from './citiesDatabase';

// Initialize the game by selecting a random city for Grok to use
export async function initializeGame(): Promise<City> {
  try {
    // In a production app, we would call the Grok API to select a city
    // For this example, we'll just randomly pick one from our cities database
    const randomIndex = Math.floor(Math.random() * majorCities.length);
    const targetCity = majorCities[randomIndex];
    
    // We would tell Grok to remember this city for the game session
    console.log(`Selected city: ${targetCity.name} (this would be sent to Grok)`);
    
    return targetCity;
  } catch (error) {
    console.error('Error initializing game:', error);
    throw new Error('Failed to initialize game');
  }
}

// Get a hint from Grok based on the hint number
export async function getHintFromGrok(hintNumber: number, cityName: string): Promise<string> {
  try {
    // In a real app, we'd call our API route that interfaces with Grok
    // For demo, we'll simulate the response with predefined hints
    
    const response = await fetch('/api/grok', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hintNumber,
        cityName,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get hint from Grok');
    }
    
    const data = await response.json();
    return data.hint;
    
  } catch (error) {
    console.error('Error getting hint:', error);
    
    // Fallback hints if API fails
    const fallbackHints = [
      "This city is on a continent with diverse cultures.",
      "The climate in this region varies seasonally.",
      "This city has historical significance in its country.",
      "There are notable landmarks that tourists often visit here.",
      "The local cuisine has some distinctive dishes.",
      "This city has a notable relationship with water.",
      "The architecture reflects certain historical periods.",
      "This city has played a role in arts and culture.",
      "Transportation systems here have certain characteristics.",
      "The city's economy focuses on specific industries."
    ];
    
    return fallbackHints[hintNumber - 1] || "No more hints available";
  }
}