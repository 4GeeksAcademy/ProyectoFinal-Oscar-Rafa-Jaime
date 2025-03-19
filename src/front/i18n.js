// src/i18n.js (update)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../translations/en.json";
import es from "../translations/es.json";

const savedLanguage = localStorage.getItem("language") || "en"; // Default to English

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
});

export const switchLanguage = (language) => {
  i18n.changeLanguage(language);
};


export default i18n;
