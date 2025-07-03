"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useLocale } from '../../i18n/LocaleProvider';

type Difficulty = 'easy' | 'medium' | 'hard';

interface HintBoxProps {
  hints: string[];
  hintCount: number;
  points: number;
  onRequestHint: () => void;
  loading: boolean;
  difficulty?: Difficulty;
}

export default function HintBox({ 
  hints, 
  hintCount, 
  points, 
  onRequestHint, 
  loading,
}: HintBoxProps) {
  const { t } = useLocale();
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
  
  return (
    <div className="bg-[#E4EFE7] p-5 pr-0 rounded-xl flex flex-col h-full max-h-screen">
      <div className="backdrop-blur-md flex flex-col h-full rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 text-[#588157] text-5xl">
          <span>
            {t.title}<span className="font-[800]">{t.titleBold}</span>
          </span>
          {/* <LanguageSelector /> */}
        </div>
      
      <div 
        ref={hintsContainerRef} 
        className="p-5 flex-grow flex flex-col overflow-y-auto scroll-smooth min-h-0"
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-700">
              {t.hints} {hintCount > 0 && <span className="text-gray-400">({hintCount}/10)</span>}
            </h2>
          </div>
        </div>
        
        {/* Hints container with ref for scrolling */}
        <div className="flex-grow space-y-4 pr-2 overflow-y-auto min-h-0">
          {hints.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-slate-500 italic text-center px-4 py-8 bg-slate-50/70 backdrop-blur-sm rounded-lg">
                {t.hintsWillAppear}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show animated dots when loading any hint */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center items-center py-8"
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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-50/70 backdrop-blur-sm p-4 rounded-lg border border-slate-200/50"
                    >
                      <p className="text-slate-700">{hint}</p>
                      <div className="text-xs text-slate-500 mt-2 flex items-center">
                        <span className="bg-slate-200/70 backdrop-blur-sm px-2 py-1 rounded-md">{t.hintNumber}{originalIndex + 1}</span>
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
      <div className="p-5 pb-0 flex-shrink-0">
        <button
          onClick={onRequestHint}
          disabled={!canRequestHint || loading}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm ${
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