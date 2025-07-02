"use client";

import { useLocale } from '../../i18n/LocaleProvider';
import { Locale } from '../../i18n';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
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

  const languages = [
    { code: 'en' as Locale, name: t.english },
    { code: 'ru' as Locale, name: t.russian },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-3 text-sm text-slate-600 hover:text-slate-800 transition-colors bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 cursor-pointer"
      >
        <span>{currentLanguage?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-lg shadow-lg z-50 text-sm">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLocale(language.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm hover:bg-slate-100 hover:font-semibold transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                locale === language.code ? 'bg-slate-50 text-[#588157] font-semibold' : 'text-slate-700'
              }`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
