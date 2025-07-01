"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GameMap from '../components/GameMap';
import HintBox from '../components/HintBox';
import { getHint } from '../utils/grokClient';
import { initializeGame, Difficulty } from '../utils/gameUtils';
import { useLocale } from '../../i18n/LocaleProvider';
import DifficultySelect from '../components/DifficultySelect';

interface City {
  name: string;
  lat: number;
  lng: number;
}

export default function GamePage() {
  const router = useRouter();
  const { t } = useLocale();
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
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
    // Check if difficulty was set from home page
    const storedDifficulty = localStorage.getItem('selectedDifficulty') as Difficulty;
    if (storedDifficulty) {
      setDifficulty(storedDifficulty);
      // Clear from localStorage after using
      localStorage.removeItem('selectedDifficulty');
      // Start the game with the selected difficulty
      startGame(storedDifficulty);
    }
  }, []);
  
  const startGame = async (selectedDifficulty: Difficulty) => {
    setLoading(true);
    try {
      const city = await initializeGame(selectedDifficulty);
      setTargetCity(city);
      setGameStarted(true);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const requestHint = async () => {
    const hintCost = hintCount >= 3 ? 10 : 0;
    if (points < hintCost) return;
    
    setLoading(true);
    try {
      setPoints(prev => prev - hintCost);
      const newHint = await getHint(hintCount + 1, targetCity?.name || '', hints);
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
    
    if (difficulty) {
      startGame(difficulty);
    }
  };
  
  const goHome = () => {
    router.push('/');
  };
  
  return (
    <main className="h-screen w-screen bg-[#E4EFE7] flex">
      {gameStarted ? (
        <>
          {/* Chat Sidebar - Fixed width */}
          <div className="min-w-96 w-96 h-full flex-shrink-0">
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
                difficulty={difficulty || undefined}
              />
            </motion.div>
          </div>

          {/* Map Area - Takes remaining space */}
          <div className="flex-1 h-full p-6 relative">
            <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-sm">
              <GameMap 
                onMarkerPlaced={handleMarkerPlaced}
                revealCity={gameOver ? (targetCity || undefined) : undefined}
                gameOver={gameOver}
              />
              
              {/* Input field at bottom center of map */}
              {!gameOver && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/70 backdrop-blur-md rounded-xl p-5 shadow-lg"
                  >
                    <div className="flex flex-col gap-4">
                      {/* City input and button - properly aligned */}
                      <div className="flex items-center gap-3">
                        <div className="flex-grow">
                          <label htmlFor="cityInput" className="text-gray-700 text-sm mb-1.5 block font-medium">
                            {t.cityName}
                          </label>
                          <div className="relative">
                            <input
                              id="cityInput"
                              type="text"
                              value={manualCityInput}
                              onChange={handleManualInputChange}
                              placeholder={t.enterCityName}
                              className="w-full h-12 px-4 rounded-lg bg-transparent text-gray-800 border border-gray-500/50 focus:border-[#588157] focus:outline-none text-base placeholder-gray-500"
                            />
                            {selectedCity && manualCityInput !== selectedCity && (
                              <p className="absolute -bottom-6 left-0 text-xs text-gray-600 mt-1">
                                {t.differentFromMap} <span className="font-medium">{selectedCity}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-7">
                          <button
                            onClick={submitGuess}
                            disabled={(!manualCityInput && !selectedCity) || !targetCity}
                            className="h-12 bg-[#588157] hover:bg-[#3a5a40] text-white px-6 rounded-lg disabled:opacity-40 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all whitespace-nowrap cursor-pointer"
                          >
                            {!targetCity ? t.startGameFirst : t.submitGuess}
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-500 text-xs text-center italic mt-1">
                        {t.writeCityOrMap}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-md p-8 rounded-xl max-w-md mx-4 shadow-xl"
              >
                <h2 className={`text-3xl font-bold mb-4 ${gameResult === 'win' ? 'text-[#588157]' : 'text-[#14213d]'}`}>
                  {gameResult === 'win' ? t.youWon : t.gameOver}
                </h2>
                
                <p className="text-gray-600 text-lg mb-8">
                  {gameResult === 'win' 
                    ? `${t.congratulations} ${targetCity?.name}!` 
                    : `${t.cityWas} ${targetCity?.name}. ${t.betterLuck}`
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={playAgain}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white font-bold py-3 px-6 rounded-lg transition-all cursor-pointer"
                  >
                    {t.playAgain}
                  </button>
                  <button
                    onClick={goHome}
                    className="bg-transparent border border-[#588157] hover:bg-[#588157]/10 text-[#588157] font-bold py-3 px-6 rounded-lg transition-all cursor-pointer"
                  >
                    {t.backToHome}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex justify-center items-center">
          {difficulty === null ? (
            // Show difficulty selection if no difficulty was set
            <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-xl max-w-md mx-4 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.selectDifficulty}</h2>
              <DifficultySelect
                selectedDifficulty={null}
                onDifficultySelect={(selectedDifficulty) => {
                  setDifficulty(selectedDifficulty);
                  startGame(selectedDifficulty);
                }}
              />
              <button
                onClick={() => router.push('/')}
                className="mt-6 text-[#588157] hover:text-[#3a5a40] underline transition-colors"
              >
                {t.backToHome}
              </button>
            </div>
          ) : (
            // Show loading spinner when game is initializing
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700 mx-auto mb-6"></div>
              <p className="text-[#588157] text-xl">{t.initializingGame}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}