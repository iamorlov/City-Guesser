import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (for Grok)
const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1", // Grok's API endpoint
});

export async function POST(request: Request) {
  try {
    const { hintNumber, cityName } = await request.json();
    
    if (!cityName) {
      return NextResponse.json(
        { error: 'City name is required' },
        { status: 400 }
      );
    }
    
    // Create a prompt for Grok that asks for an appropriate hint
    const prompt = `
      You are helping with a geography guessing game. The player needs to guess the city: ${cityName}.
      
      Please provide hint #${hintNumber} about this city. 
      
      Guidelines:
      - NEVER reveal the name of the city or country directly
      - For early hints (1-3), be very abstract and general
      - For middle hints (4-6), provide more specific geographical or cultural clues
      - For later hints (7+), give more concrete details about landmarks, history, etc.
      - Keep hints to 1-2 sentences maximum
      - Ensure the hint is factually accurate
      - Make the hints progressively more specific
      
      Respond with ONLY the hint text, nothing else.
    `;
    
    // Call Grok API
    const completion = await client.chat.completions.create({
      model: "grok-3-mini", // Adjust based on the actual model name
      messages: [
        { role: "system", content: "You provide geography hints that are progressively more specific but never reveal the city name directly." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7, // Add some variety to the hints
    });
    
    // Extract the hint from Grok's response
    const hint = completion.choices[0]?.message?.content?.trim() || "No hint available";
    
    return NextResponse.json({ hint });
    
  } catch (error: unknown) {
    console.error('Grok API error:', error);
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate hint',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// For testing - simulate responses if you don't have Grok API access yet
export async function GET() {
  const sampleHints = [
    "This city is located on a continent with a rich tapestry of cultures and languages.",
    "The climate here features distinct seasons, with specific temperature patterns throughout the year.",
    "This urban area has historical significance dating back several centuries.",
    "Water plays an important role in the geography and development of this location.",
    "The local cuisine is known for specific ingredients and cooking techniques.",
    "Certain architectural styles are prominent in the city's skyline and historical districts.",
    "This city has been featured in several famous works of art and literature.",
    "The city is known for a specific type of transportation system that many visitors use.",
    "A significant landmark here can be seen from many points throughout the city.",
    "The city hosts an internationally recognized annual event or festival."
  ];
  
  return NextResponse.json({
    status: "API is running",
    sampleHints
  });
}