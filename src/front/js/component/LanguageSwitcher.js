import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/languageSwitcher.css";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);
  
    const switchLanguage = (lang) => {
      i18n.changeLanguage(lang);
    };
  
    return (
        <div className={`language-switcher ${isOpen ? "open" : ""}`}>
        <button onClick={toggleDropdown}>Language</button>
        <div className="language-dropdown">
          <button onClick={() => switchLanguage("en")}>English</button>
          <button onClick={() => switchLanguage("es")}>Español</button>
        </div>
      </div>
    );
  };
  
export default LanguageSwitcher;