"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GameMap from '../components/GameMap';
import HintBox from '../components/HintBox';
import { getHintFromGrok, initializeGame } from '../lib/grokAPI';

interface City {
  name: string;
  lat: number;
  lng: number;
}

export default function GamePage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [points, setPoints] = useState(100);
  const [hints, setHints] = useState<string[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  
  // Initialize the game
  useEffect(() => {
    const startGame = async () => {
      setLoading(true);
      try {
        const city = await initializeGame();
        setTargetCity(city);
        setGameStarted(true);
      } catch (error) {
        console.error('Failed to start game:', error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };
    
    startGame();
  }, []);
  
  // Handle requesting a hint
  const requestHint = async () => {
    // Calculate hint cost
    const hintCost = hintCount >= 3 ? 13 : 0;
    
    // Check if player has enough points
    if (points < hintCost) return;
    
    setLoading(true);
    try {
      // Deduct points
      setPoints(prev => prev - hintCost);
      
      // Get new hint
      const newHint = await getHintFromGrok(hintCount + 1, targetCity?.name || '');
      
      // Add hint to list
      setHints(prev => [...prev, newHint]);
      setHintCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setLoading(false);
    }
    
    // Check if player has run out of points
    if (points - hintCost <= 0) {
      endGame('lose');
    }
  };
  
  // Handle marker placement
  const handleMarkerPlaced = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    
    // Get city name from coordinates (using reverse geocoding)
    // This is a simplified approach - you'd use Google's Geocoding API in production
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        // Extract city name from response
        let city = '';
        
        for (const result of data.results) {
          for (const component of result.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
              break;
            }
          }
          if (city) break;
        }
        
        setSelectedCity(city);
      })
      .catch(err => {
        console.error('Error getting city name:', err);
      });
  };
  
  // Handle submitting a guess
  const submitGuess = () => {
    if (!selectedCity || !targetCity) return;
    
    // Check if the guess is correct
    // Using case-insensitive comparison and trim to handle minor differences
    const isCorrect = selectedCity.trim().toLowerCase() === targetCity.name.trim().toLowerCase();
    
    if (isCorrect) {
      endGame('win');
    } else {
      // Incorrect guess penalty
      const newPoints = points - 20;
      setPoints(newPoints);
      
      if (newPoints <= 0) {
        endGame('lose');
      }
    }
  };
  
  // End game function
  const endGame = (result: 'win' | 'lose') => {
    setGameOver(true);
    setGameResult(result);
  };
  
  // Start a new game
  const playAgain = () => {
    router.refresh();
  };
  
  // Go back to home page
  const goHome = () => {
    router.push('/');
  };
  
  return (
    <main className="flex min-h-screen flex-col p-4 bg-gradient-to-br from-indigo-900 to-purple-900">
      {/* Game header */}
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">City Guesser</h1>
          <div className="bg-purple-800/50 text-purple-100 px-4 py-2 rounded-lg">
            Points: <span className="font-bold">{points}</span>
          </div>
        </div>
        
        {gameStarted ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hints section */}
            <div className="md:col-span-1">
              <HintBox 
                hints={hints}
                hintCount={hintCount}
                points={points}
                onRequestHint={requestHint}
                loading={loading}
              />
            </div>
            
            {/* Map section */}
            <div className="md:col-span-2">
              <GameMap 
                onMarkerPlaced={handleMarkerPlaced}
                revealCity={gameOver ? (targetCity || undefined) : undefined}
                gameOver={gameOver}
              />
              
              {/* Guess controls */}
              {!gameOver && (
                <div className="mt-4 bg-purple-900/30 backdrop-blur-md rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-purple-200 mb-1">Selected Location:</p>
                      <p className="text-white font-medium">
                        {selectedCity ? selectedCity : 'No location selected'}
                      </p>
                    </div>
                    <button
                      onClick={submitGuess}
                      disabled={!selectedCity}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Submit Guess
                    </button>
                  </div>
                </div>
              )}
              
              {/* Game over message */}
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-6 rounded-xl text-center"
                >
                  <h2 className={`text-2xl font-bold mb-3 ${
                    gameResult === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {gameResult === 'win' ? 'You Won! 🎉' : 'Game Over!'}
                  </h2>
                  
                  <p className="text-white mb-6">
                    {gameResult === 'win' 
                      ? `Congratulations! You correctly identified ${targetCity?.name}!` 
                      : `The city was ${targetCity?.name}. Better luck next time!`
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={playAgain}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={goHome}
                      className="bg-transparent border border-purple-400 hover:bg-purple-900/30 text-purple-100 font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-purple-200">Initializing game...</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}