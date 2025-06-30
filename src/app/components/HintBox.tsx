"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HintBoxProps {
  hints: string[];
  hintCount: number;
  points: number;
  onRequestHint: () => void;
  loading: boolean;
}

export default function HintBox({ 
  hints, 
  hintCount, 
  points, 
  onRequestHint, 
  loading,
}: HintBoxProps) {
  // Create a ref for the scrollable container
  const hintsContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when hints change
  useEffect(() => {
    if (hintsContainerRef.current && hints.length > 0) {
      setTimeout(() => {
        hintsContainerRef.current!.scrollTop = hintsContainerRef.current!.scrollHeight;
      }, 100); // Small delay to ensure animation has started
    }
  }, [hints]);
  
  const hintCost = hintCount >= 3 ? 10 : 0;
  const canRequestHint = points >= hintCost;
  
  // Function to determine button text based on hint count
  const getButtonText = () => {
    if (!canRequestHint) {
      return `Not enough points (${points}/${hintCost})`;
    }
    
    // Use hint count to determine text
    if (hintCount === 0) {
      return "Let's play!";
    } else {
      return "Next hint!";
    }
  };
  
  return (
    <div className="bg-[#E4EFE7] p-5 rounded-xl flex flex-col h-full max-h-screen">
      <div className="backdrop-blur-md flex flex-col h-full rounded-lg overflow-hidden">
        <div className="flex px-5 text-[#588157] text-5xl">
          Guess<span className="font-[800]">me</span>
        </div>
      
      <div 
        ref={hintsContainerRef} 
        className="p-5 flex-grow flex flex-col overflow-y-auto scroll-smooth min-h-0"
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-700">
            Hints {hintCount > 0 && <span className="text-gray-400">({hintCount}/10)</span>}
          </h2>
        </div>
        
        {/* Hints container with ref for scrolling */}
        <div className="flex-grow space-y-4 pr-2 overflow-y-auto min-h-0">
          {hints.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-slate-500 italic text-center px-4 py-8 bg-slate-50/70 backdrop-blur-sm rounded-lg">
                Hints will appear here as you request them
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {hints.map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-50/70 backdrop-blur-sm p-4 rounded-lg border border-slate-200/50"
                >
                  <p className="text-slate-700">{hint}</p>
                  <div className="text-xs text-slate-500 mt-2 flex items-center">
                    <span className="bg-slate-200/70 backdrop-blur-sm px-2 py-1 rounded-md">Hint #{index + 1}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
              Getting hint...
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