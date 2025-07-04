"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '../../i18n/LocaleProvider';

type Difficulty = 'easy' | 'medium' | 'hard';

interface HintBoxProps {
  hints: string[];
  hintCount: number;
  points: number;
  onRequestHint: () => void;
  loading: boolean;
  difficulty?: Difficulty;
  onRestart?: () => void;
}

export default function HintBox({ 
  hints, 
  hintCount, 
  points, 
  onRequestHint, 
  loading,
  onRestart,
}: HintBoxProps) {
  const { t } = useLocale();
  const router = useRouter();
  // Create a ref for the scrollable container
  const hintsContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when hints change (since latest hints are now on top)
  useEffect(() => {
    if (hintsContainerRef.current && hints.length > 0) {
      setTimeout(() => {
        hintsContainerRef.current!.scrollTop = 0;
      }, 100); // Small delay to ensure animation has started
    }
  }, [hints]);
  
  const hintCost = hintCount >= 3 ? 10 : 0;
  const canRequestHint = points >= hintCost;
  
  // Function to determine button text based on hint count
  const getButtonText = () => {
    if (!canRequestHint) {
      return `${t.notEnoughHints} (${points}/${hintCost})`;
    }
    
    // Use hint count to determine text
    if (hintCount === 0) {
      return t.letsPlay;
    } else {
      return t.nextHint;
    }
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleRestartClick = () => {
    // Add a small delay to prevent DOM manipulation conflicts
    setTimeout(() => {
      if (onRestart) {
        onRestart();
      }
    }, 50);
  };
  
  return (
    <div className="bg-[#E4EFE7] p-1 sm:p-5 rounded-xl flex flex-col h-full max-h-screen">
      <div className="backdrop-blur-md flex flex-col h-full rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-5 text-[#588157] text-3xl sm:text-4xl lg:text-5xl">
          <span>
            {t.title}<span className="font-[800]">{t.titleBold}</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              className="py-2.5 px-4 sm:p-2 rounded-lg bg-white/25 hover:bg-white/50 text-[#588157] hover:text-[#3a5a40] transition-all duration-200 cursor-pointer"
              title="Home"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>
            
            {/* Restart Button */}
            <button
              onClick={handleRestartClick}
              className="py-2.5 px-4 sm:p-2 rounded-lg bg-white/25 hover:bg-white/50 text-[#588157] hover:text-[#3a5a40] transition-all duration-200 cursor-pointer"
              title="Restart"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      
      <div 
        ref={hintsContainerRef} 
        className="p-3 sm:p-5 flex-grow flex flex-col overflow-y-auto scroll-smooth min-h-0"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg text-gray-600">
              <span className="font-bold">{t.hints} </span>{hintCount > 0 && <span className="text-gray-400">({hintCount}/10)</span>}
            </h2>
          </div>
        </div>
        
        {/* Hints container with ref for scrolling */}
        <div className="flex-grow space-y-3 sm:space-y-4 pr-2 overflow-y-auto min-h-0 hints-scrollbar">
          {hints.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[200px]">
              <p className="text-slate-500 italic text-center px-3 sm:px-4 py-6 sm:py-8 bg-slate-50/70 backdrop-blur-sm rounded-lg text-sm sm:text-base">
                {t.hintsWillAppear}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Show animated dots when loading any hint */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center items-center py-6 sm:py-8"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#588157] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#588157] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#588157] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </motion.div>
              )}
              
              {/* Show hints in reverse order (latest on top) */}
              <AnimatePresence>
                {hints.slice().reverse().map((hint, reverseIndex) => {
                  const originalIndex = hints.length - 1 - reverseIndex;
                  return (
                    <motion.div
                      key={originalIndex}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-50/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-slate-200/50"
                    >
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{hint}</p>
                      <div className="text-xs text-slate-500 mt-2 flex items-center">
                        <span className="bg-slate-200/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs">{t.hintNumber}{originalIndex + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* Button outside scrollable area */}
      <div className="p-3 sm:p-5 sm:pb-0 flex-shrink-0">
        <button
          onClick={onRequestHint}
          disabled={!canRequestHint || loading}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm text-sm sm:text-base ${
            canRequestHint 
              ? 'bg-[#588157] hover:bg-[#3a5a40] text-white' 
              : 'bg-slate-200/70 text-slate-400 cursor-not-allowed backdrop-blur-sm border border-slate-300/50'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.gettingHint}
            </span>
          ) : (
            <span>
              {getButtonText()}
            </span>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}