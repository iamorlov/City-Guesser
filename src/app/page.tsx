"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setIsStarting(true);
    // Add a small delay for animation
    setTimeout(() => router.push("/game"), 300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-500 to-emerald-500">
            City Guesser
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-12">
          Guess the mystery city with help from Grok AI. Get clues, place markers,
          and test your geography knowledge!
        </p>

        <motion.button
          onClick={handleStart}
          disabled={isStarting}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-all disabled:opacity-70 border border-green-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isStarting ? (
            <span className="flex items-center">
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
              Starting Game...
            </span>
          ) : (
            "Start Game"
          )}
        </motion.button>

        <div className="mt-16 text-gray-500 text-sm">
          <p>Powered by Google Maps and Grok AI</p>
        </div>
      </motion.div>
    </main>
  );
}
