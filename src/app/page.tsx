"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MapBackground from "./components/MapBackground";
import { useLocale } from "../i18n/LocaleProvider";
import LanguageSelector from "./components/LanguageSelector";
import DifficultySelect, { Difficulty } from "./components/DifficultySelect";

export default function Home() {
  const [isStarting, setIsStarting] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>('medium');
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { t } = useLocale();

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('geo-difficulty') as Difficulty;
    if (saved && ['easy', 'medium', 'hard'].includes(saved)) {
      setSelectedDifficulty(saved);
    }
  }, []);

  // Save difficulty to localStorage whenever it changes (but only after hydration)
  useEffect(() => {
    if (isHydrated && selectedDifficulty) {
      localStorage.setItem('geo-difficulty', selectedDifficulty);
    }
  }, [selectedDifficulty, isHydrated]);

  const handleStart = () => {
    if (!selectedDifficulty) return;

    setIsStarting(true);
    // Add a small delay for animation
    setTimeout(() => router.push("/game"), 300);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-4 overflow-hidden">
      <MapBackground />

      {/* Language selector positioned in top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <LanguageSelector />
      </div>

      <div className="relative text-center w-full max-w-6xl mx-auto py-6 px-6 sm:py-8 sm:px-8 md:px-16 rounded-3xl sm:rounded-[4rem] md:rounded-[7rem] bg-white/5 backdrop-blur-[2px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-gray-800 mb-8 sm:mb-10 md:mb-12 z-10 relative leading-tight">
            <span className="text-[#588157]">
              {t.title}<span className="font-[700]">{t.titleBold}</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12 z-10 relative font-semibold px-2">
            {t.tagline}
          </p>

          {/* Difficulty Selection */}
          <div className="mb-6 sm:mb-8 z-10 relative">
            <DifficultySelect
              selectedDifficulty={selectedDifficulty}
              onDifficultySelect={setSelectedDifficulty}
            />
            <motion.button
              onClick={handleStart}
              disabled={isStarting || !selectedDifficulty}
              className={`font-bold py-4 px-8 sm:py-5 sm:px-12 md:px-16 mt-6 sm:mt-8 rounded-full w-full max-w-xs mx-auto relative z-10 text-lg sm:text-xl ${selectedDifficulty
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white cursor-pointer transition-all duration-300 ease-in-out hover:shadow-sm'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } ${isStarting ? 'opacity-70' : ''}`}
            >
              {isStarting ? (
                <span className="flex items-center justify-center z-10 relative">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t.starting}
                </span>
              ) : (
                t.start
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
