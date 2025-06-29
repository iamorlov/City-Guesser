"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import MapBackground from "./components/MapBackground";

export default function Home() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setIsStarting(true);
    // Add a small delay for animation
    setTimeout(() => router.push("/game"), 300);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <MapBackground />
      <div className="relative text-center max-w-3xl mx-auto py-8 px-16 rounded-[2.5rem] overflow-hidden">
        <div className="liquid-glass"></div>
        <div className="liquid-glass-tint"></div>
        <div className="liquid-glass-shine"></div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-12 z-10 relative">
            <span className="bg-gradient-to-b from-[#588157] to-[#344e41] bg-clip-text text-transparent">
              City Guesser
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-12 z-10 relative">
            Test your geography knowledge!
          </p>

          <motion.button
            onClick={handleStart}
            disabled={isStarting}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition-all disabled:opacity-70 border border-green-500/30 z-10 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isStarting ? (
              <span className="flex items-center z-10 relative">
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
        </motion.div>
      </div>

      <svg style={{ display: "none" }}>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.001 0.005"
            numOctaves="1"
            seed="17"
            result="turbulence"
          />

          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>

          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>

          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="200"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </main>
  );
}
