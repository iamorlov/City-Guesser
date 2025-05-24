"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GameMap from '../components/GameMap';
import HintBox from '../components/HintBox';
import { getHint } from '../utils/grokClient';
import { initializeGame } from '../utils/gameUtils';

interface City {
  name: string;
  lat: number;
  lng: number;
}

export default function GamePage() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [points, setPoints] = useState(70);
  const [hints, setHints] = useState<string[]>([]);
  const [hintCount, setHintCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [manualCityInput, setManualCityInput] = useState<string>('');
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  
  useEffect(() => {
    const startGame = async () => {
      setLoading(true);
      try {
        const city = await initializeGame();
        setTargetCity(city);
        setGameStarted(true);
      } catch (error) {
        console.error('Failed to start game:', error);
      } finally {
        setLoading(false);
      }
    };
    
    startGame();
  }, []);
  
  const requestHint = async () => {
    const hintCost = hintCount >= 3 ? 10 : 0;
    if (points < hintCost) return;
    
    setLoading(true);
    try {
      setPoints(prev => prev - hintCost);
      const newHint = await getHint(hintCount + 1, targetCity?.name || '');
      setHints(prev => [...prev, newHint]);
      setHintCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setLoading(false);
    }
    
    if (points - hintCost < 0) {
      endGame('lose');
    }
  };
  
  const handleMarkerPlaced = (lat: number, lng: number) => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
      .then(res => res.json())
      .then(data => {
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
        setManualCityInput(city);
      })
      .catch(err => {
        console.error('Error getting city name:', err);
      });
  };
  
  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualCityInput(e.target.value);
    if (e.target.value !== selectedCity) {
      setSelectedCity('');
    }
  };
  
  const submitGuess = () => {
    const guessCity = manualCityInput || selectedCity;
    
    if (!guessCity || !targetCity) return;
    
    const isCorrect = guessCity.trim().toLowerCase() === targetCity.name.trim().toLowerCase();
    
    if (isCorrect) {
      endGame('win');
    } else {
      const newPoints = points - 20;
      setPoints(newPoints);
      
      if (newPoints <= 0) {
        endGame('lose');
      }
    }
  };
  
  const endGame = (result: 'win' | 'lose') => {
    setGameOver(true);
    setGameResult(result);
  };
  
  const playAgain = () => {
    setGameStarted(false);
    setPoints(70);
    setHints([]);
    setHintCount(0);
    setLoading(false);
    setSelectedCity('');
    setManualCityInput('');
    setTargetCity(null);
    setGameOver(false);
    setGameResult(null);
    
    const startNewGame = async () => {
      setLoading(true);
      try {
        const city = await initializeGame();
        setTargetCity(city);
        setGameStarted(true);
      } catch (error) {
        console.error('Failed to start new game:', error);
      } finally {
        setLoading(false);
      }
    };
    
    startNewGame();
  };
  
  const goHome = () => {
    router.push('/');
  };
  
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
      {gameStarted ? (
        <>
          <div className="absolute inset-0 z-0">
            <GameMap 
              onMarkerPlaced={handleMarkerPlaced}
              revealCity={gameOver ? (targetCity || undefined) : undefined}
              gameOver={gameOver}
            />
          </div>
          
          <div className="absolute left-0 top-0 bottom-0 z-20 w-96">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col"
            >
              <HintBox 
                hints={hints}
                hintCount={hintCount}
                points={points}
                onRequestHint={requestHint}
                loading={loading}
                gameTitle="City Guesser" // Pass the game title to HintBox
              />
            </motion.div>
          </div>
          
          {!gameOver && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-2xl px-4">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white backdrop-blur-md rounded-xl p-5 shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  {/* City input and button - properly aligned */}
                  <div className="flex items-center gap-3">
                    <div className="flex-grow">
                      <label htmlFor="cityInput" className="text-gray-700 text-sm mb-1.5 block font-medium">
                        City Name
                      </label>
                      <div className="relative">
                        <input
                          id="cityInput"
                          type="text"
                          value={manualCityInput}
                          onChange={handleManualInputChange}
                          placeholder="Enter city name..."
                          className="w-full h-12 px-4 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-gray-500 focus:outline-none text-base"
                        />
                        {selectedCity && manualCityInput !== selectedCity && (
                          <p className="absolute -bottom-6 left-0 text-xs text-gray-600 mt-1">
                            Different from map selection: <span className="font-medium">{selectedCity}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-7">
                      <button
                        onClick={submitGuess}
                        disabled={(!manualCityInput && !selectedCity) || !targetCity}
                        className="h-12 bg-gray-700 hover:bg-gray-800 text-white font-medium px-6 rounded-lg disabled:opacity-40 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      >
                        {!targetCity ? "Start Game First" : "Submit Guess"}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-xs text-center italic mt-1">
                    Write city name or find it on the map
                  </p>
                </div>
              </motion.div>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900/90 backdrop-blur-md p-8 rounded-xl max-w-md mx-4"
              >
                <h2 className={`text-3xl font-bold mb-4 ${
                  gameResult === 'win' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {gameResult === 'win' ? 'You Won! 🎉' : 'Game Over!'}
                </h2>
                
                <p className="text-white text-lg mb-8">
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
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-6"></div>
            <p className="text-purple-200 text-xl">Initializing game...</p>
          </div>
        </div>
      )}
    </main>
  );
}