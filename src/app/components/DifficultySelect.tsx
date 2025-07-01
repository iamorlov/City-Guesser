"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleProvider';
import { useState, useRef, useEffect } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyOption {
  id: Difficulty;
  name: string;
  description: string;
}

interface DifficultySelectProps {
  selectedDifficulty: Difficulty | null;
  onDifficultySelect: (difficulty: Difficulty) => void;
}

export default function DifficultySelect({ selectedDifficulty, onDifficultySelect }: DifficultySelectProps) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const difficulties: DifficultyOption[] = [
    {
      id: 'easy',
      name: t.easy,
      description: t.easyDescription,
    },
    {
      id: 'medium',
      name: t.medium,
      description: t.mediumDescription,
    },
    {
      id: 'hard',
      name: t.hard,
      description: t.hardDescription,
    }
  ];

  const selectedOption = difficulties.find(d => d.id === selectedDifficulty);

  return (
    <div className="w-full max-w-sm mx-auto relative z-20">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white/90 backdrop-blur-sm rounded-full px-8 py-3 text-left focus:outline-none transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            {selectedOption ? (
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-medium text-gray-600">{selectedOption.name}</div>
                  <div className="text-sm text-gray-500">{selectedOption.description}</div>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">{t.selectDifficulty}</span>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg z-50 cursor-pointer"
            >
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => {
                    onDifficultySelect(difficulty.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-8 py-3 text-left transition-colors first:rounded-t-3xl last:rounded-b-3xl relative z-40 cursor-pointer ${
                    selectedDifficulty === difficulty.id
                      ? 'bg-[#588157]/10 text-[#588157]'
                      : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-gray-600">{difficulty.name}</div>
                      <div className="text-sm text-gray-500">{difficulty.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
