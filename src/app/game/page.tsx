"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GameMap from '../components/GameMap';
import HintBox from '../components/HintBox';
import { getHint } from '../utils/grokClient';
import { initializeGame, Difficulty } from '../utils/gameUtils';
import { useLocale } from '../../i18n/LocaleProvider';
import DifficultySelect from '../components/DifficultySelect';
import MapBackground from '../components/MapBackground';
import { City } from '../../types';

export default function GamePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
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
  const [showHints, setShowHints] = useState(true); // For mobile toggle
  const [gameKey, setGameKey] = useState(0); // Key to force GameMap remount on restart

  // Function to get difficulty display info
  const getDifficultyInfo = () => {
    if (!difficulty) return null;

    const difficultyMap = {
      easy: { name: t.easy},
      medium: { name: t.medium},
      hard: { name: t.hard},
    };

    return difficultyMap[difficulty];
  };

  const difficultyInfo = getDifficultyInfo();

  const startGame = useCallback(async (selectedDifficulty: Difficulty) => {
    console.log('startGame called with difficulty:', selectedDifficulty);
    setLoading(true);
    try {
      const city = await initializeGame(selectedDifficulty, locale);
      setTargetCity(city);
      setGameStarted(true);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    let mounted = true; // Flag to prevent double execution
    
    const initGame = async () => {
      if (!mounted) return; // Exit if component unmounted or effect already ran
      
      // Load difficulty from localStorage after hydration
      const storedDifficulty = localStorage.getItem('geo-difficulty') as Difficulty;
      
      if (storedDifficulty && ['easy', 'medium', 'hard'].includes(storedDifficulty)) {
        setDifficulty(storedDifficulty);
        // Start the game with the selected difficulty
        if (mounted) {
          await startGame(storedDifficulty);
        }
      } else {
        // Fallback to medium difficulty if no valid difficulty is stored
        setDifficulty('medium');
        if (mounted) {
          await startGame('medium');
        }
      }
    };
    
    initGame();
    
    // Cleanup function to prevent double execution
    return () => {
      mounted = false;
    };
  }, [startGame]);

  const requestHint = async () => {
    const hintCost = hintCount >= 3 ? 10 : 0;
    if (points < hintCost) return;

    setLoading(true);
    try {
      setPoints(prev => prev - hintCost);
      const newHint = await getHint(hintCount + 1, targetCity?.name || '', hints, locale);
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitGuess();
    }
  };

  const submitGuess = () => {
    const guessCity = manualCityInput || selectedCity;

    if (!guessCity || !targetCity) return;

    const guessLower = guessCity.trim().toLowerCase();
    const targetNameLower = targetCity.name.trim().toLowerCase();
    const targetNameEnLower = targetCity.nameEn.trim().toLowerCase();

    // Check if the guess matches either the localized name or English name
    const isCorrect = guessLower === targetNameLower || guessLower === targetNameEnLower;

    if (isCorrect) {
      endGame('win');
    } else {
      endGame('lose');
    }
  };

  const endGame = (result: 'win' | 'lose') => {
    setGameOver(true);
    setGameResult(result);
  };

  const playAgain = useCallback(() => {
    // Reset all game state first
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
    
    // Increment game key to force GameMap remount
    setGameKey(prev => prev + 1);

    // Use setTimeout to allow React to finish processing state updates
    // before starting a new game to prevent DOM manipulation conflicts
    setTimeout(() => {
      if (difficulty) {
        startGame(difficulty);
      }
    }, 100);
  }, [difficulty, startGame]);

  const goHome = () => {
    router.push('/');
  };

  return (
    <main className={`h-screen w-screen flex flex-col lg:flex-row ${difficulty !== null ? 'bg-[#E4EFE7]' : ''}`}>
      {gameStarted ? (
        <>
          {/* Mobile Toggle Buttons */}
          <div className="lg:hidden fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
            <div className="flex">
              <button
                onClick={() => setShowHints(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-w-[7rem] ${
                  showHints 
                    ? 'bg-[#588157] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-[#588157]'
                }`}
              >
                {t.hints}
              </button>
              <button
                onClick={() => setShowHints(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-w-[7rem] ${
                  !showHints 
                    ? 'bg-[#588157] text-white shadow-sm' 
                    : 'text-gray-600 hover:text-[#588157]'
                }`}
              >
                {t.map}
              </button>
            </div>
          </div>

          {/* Desktop Layout: Chat Sidebar - Fixed width */}
          <div className="hidden lg:block min-w-108 w-108 h-full flex-shrink-0">
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
                onRestart={playAgain}
              />
            </motion.div>
          </div>

          {/* Mobile Layout: Hints Panel */}
          <div className={`lg:hidden h-full w-full ${showHints ? 'block' : 'hidden'}`}>
            <div className="h-full pt-20 pb-4 px-4">
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
                  onRestart={playAgain}
                />
              </motion.div>
            </div>
          </div>

          {/* Desktop Map Area - Takes remaining space */}
          <div className="hidden lg:block flex-1 h-full p-6 relative">
            <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-sm">
              <GameMap
                key={`desktop-map-${gameKey}`}
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
                              onKeyPress={handleKeyPress}
                              placeholder={t.enterCityName}
                              className="w-full h-12 px-4 rounded-lg bg-transparent text-gray-700 border border-gray-500/20 focus:border-gray-500/60 focus:outline-none text-base placeholder-gray-400"
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

                      <p className="text-gray-500 text-xs text-center mt-1">
                        <span className="italic">{t.writeCityOrMap}</span>
                        {difficultyInfo && (
                          <>
                            &nbsp;•&nbsp;
                            <span className="mr-1">{t.difficultyLevel}</span>
                            <span className="font-semibold">
                              {difficultyInfo.name}
                            </span></>
                        )}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Map Area */}
          <div className={`lg:hidden h-full w-full ${!showHints ? 'block' : 'hidden'}`}>
            <div className="h-full p-4 pt-11 relative">
              <div className="w-full h-full rounded-xl overflow-hidden relative shadow-sm">
                <GameMap
                  key={`mobile-map-${gameKey}`}
                  onMarkerPlaced={handleMarkerPlaced}
                  revealCity={gameOver ? (targetCity || undefined) : undefined}
                  gameOver={gameOver}
                />

                {/* Mobile Input field - simplified for smaller screens */}
                {!gameOver && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-lg"
                    >
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="cityInputMobile" className="text-gray-700 text-sm mb-1.5 block font-medium">
                            {t.cityName}
                          </label>
                          <input
                            id="cityInputMobile"
                            type="text"
                            value={manualCityInput}
                            onChange={handleManualInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={t.enterCityName}
                            className="w-full h-12 px-4 rounded-lg bg-white/80 text-gray-700 border border-gray-300 focus:border-[#588157] focus:outline-none text-base placeholder-gray-400"
                          />
                          {selectedCity && manualCityInput !== selectedCity && (
                            <p className="text-xs text-gray-600 mt-1">
                              {t.differentFromMap} <span className="font-medium">{selectedCity}</span>
                            </p>
                          )}
                        </div>

                        <button
                          onClick={submitGuess}
                          disabled={(!manualCityInput && !selectedCity) || !targetCity}
                          className="w-full h-12 bg-[#588157] hover:bg-[#3a5a40] text-white rounded-lg disabled:opacity-40 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium cursor-pointer"
                        >
                          {!targetCity ? t.startGameFirst : t.submitGuess}
                        </button>

                        {difficultyInfo && (
                          <p className="text-gray-500 text-xs text-center">
                            <span className="mr-1">{t.difficultyLevel}</span>
                            <span className="font-semibold">{difficultyInfo.name}</span>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-xl max-w-lg mx-4 shadow-xl w-full"
              >
                <h2 className={`text-2xl sm:text-3xl font-bold mb-4 text-center ${gameResult === 'win' ? 'text-[#588157]' : 'text-[#14213d]'}`}>
                  {gameResult === 'win' ? t.youWon : t.gameOver}
                </h2>

                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 text-center">
                  {gameResult === 'win'
                    ? `${t.congratulations} ${targetCity?.name}!`
                    : `${t.cityWas} ${targetCity?.name}. ${t.betterLuck}`
                  }
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <button
                    onClick={playAgain}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white font-bold py-3 px-6 rounded-lg transition-all cursor-pointer text-center"
                  >
                    {t.playAgain}
                  </button>
                  <button
                    onClick={goHome}
                    className="bg-transparent border border-[#588157] hover:bg-[#588157]/10 text-[#588157] font-bold py-3 px-6 rounded-lg transition-all cursor-pointer text-center"
                  >
                    {t.backToHome}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex justify-center items-center p-4">
          {difficulty === null ? (
            <>
              <MapBackground />

              <div className="text-center p-6 sm:p-8 w-full max-w-xl mx-4 rounded-2xl sm:rounded-[4rem] bg-white/5 backdrop-blur-[3px]">
                <h2 className="text-xl sm:text-2xl font-bold text-[#588157] mb-4 sm:mb-6">{t.selectDifficultyRequired}</h2>
                <DifficultySelect
                  selectedDifficulty={null}
                  onDifficultySelect={(selectedDifficulty) => {
                    setDifficulty(selectedDifficulty);
                    startGame(selectedDifficulty);
                  }}
                />
                <button
                  onClick={() => router.push('/')}
                  className="font-semibold py-4 px-8 sm:py-5 sm:px-16 mt-6 sm:mt-8 rounded-full w-full max-w-xs mx-auto relative z-10 text-lg sm:text-xl transition-all bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg cursor-pointer"
                >
                  {t.backToHome}
                </button>
              </div></>
          ) : (
            // Show loading spinner when game is initializing
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-green-700 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-[#588157] text-lg sm:text-xl">{t.initializingGame}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}