"use client";

import { motion, AnimatePresence } from 'framer-motion';

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
  loading 
}: HintBoxProps) {
  
  const hintCost = hintCount >= 3 ? 13 : 0;
  const canRequestHint = points >= hintCost;
  
  return (
    <div className="bg-purple-900/30 backdrop-blur-md rounded-xl p-4 shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-purple-100">City Clues</h2>
        <div className="text-sm text-purple-200">
          {hintCount >= 3 ? (
            <span>-10 points per hint</span>
          ) : (
            <span>First 3 hints are free!</span>
          )}
        </div>
      </div>
      
      <div className="h-[300px] overflow-y-auto mb-4 space-y-3 p-2">
        {hints.length === 0 ? (
          <p className="text-purple-300 italic text-center mt-12">
            Request your first hint to start guessing!
          </p>
        ) : (
          <AnimatePresence>
            {hints.map((hint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-purple-800/40 p-3 rounded-lg"
              >
                <p className="text-purple-100">{hint}</p>
                <div className="text-xs text-purple-400 mt-1">Hint #{index + 1}</div>
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
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-purple-900 text-purple-400 cursor-not-allowed'
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
            {canRequestHint 
              ? hintCost > 0 
                ? `Request Next Hint (-${hintCost} pts)` 
                : "Request Next Hint (Free!)" 
              : `Not enough points (${points}/${hintCost})`
            }
          </span>
        )}
      </button>
    </div>
  );
}