"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface HintBoxProps {
  hints: string[];
  hintCount: number;
  points: number;
  onRequestHint: () => void;
  loading: boolean;
  gameTitle: string;
}

export default function HintBox({ 
  hints, 
  hintCount, 
  points, 
  onRequestHint, 
  loading,
  gameTitle
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
    <div className="bg-white/95 backdrop-blur-md flex flex-col h-full shadow-lg">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{gameTitle}</h1>
        <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
          Points: <span className="font-bold">{points}</span>
        </div>
      </div>
      
      <div 
        ref={hintsContainerRef} 
        className="p-6 flex-grow flex flex-col overflow-y-auto scroll-smooth"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Hints</h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {hintCount >= 3 ? (
              <span>-{hintCost} points per hint</span>
            ) : (
              <span>First 3 hints are free!</span>
            )}
          </div>
        </div>
        
        {/* Hints container with ref for scrolling */}
        <div className="flex-grow mb-6 space-y-4 pr-2">
          {hints.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-gray-500 italic text-center px-4 py-8 bg-gray-100 rounded-lg">
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
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <p className="text-gray-700">{hint}</p>
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="bg-gray-200 px-2 py-1 rounded-md">Hint #{index + 1}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        <button
          onClick={onRequestHint}
          disabled={!canRequestHint || loading}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all ${
            canRequestHint 
              ? 'bg-gray-800 hover:bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
  );
}