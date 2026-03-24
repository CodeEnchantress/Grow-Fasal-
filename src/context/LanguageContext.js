"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../locales";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("grow-fasal-lang");
    if (saved) setLang(saved);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("grow-fasal-lang", newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
