// src/front/js/component/navbar.js
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/navbar.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher"; // Import the LanguageSwitcher component

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    actions.setUser(null);
    navigate("/");
  };

  // Determinamos la ruta de "home" según el tipo de usuario.
  const homeRoute = store.user
    ? (store.user.is_artist ? `/artist/${store.user.id}` : `/homeuser/${store.user.id}`)
    : "/";

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={homeRoute} className="navbar-brand">
          SoundCript
        </Link>

        <div className="navbar-right">
          <LanguageSwitcher /> {/* Display the LanguageSwitcher component here */}

          <div className="user-menu">
            <div className="user-icon" onClick={toggleMenu}>
              <img
                src={
                  store.user && store.user.profile_photo
                    ? store.user.profile_photo
                    : "https://cdn-icons-png.flaticon.com/512/3106/3106921.png"
                }
                alt={t("Perfil de Usuario")}
              />
            </div>
            <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
              {store.user && store.user.is_artist ? (
                <>
                  {/* Link para ir al perfil artista */}
                  <Link
                    to={`/artist/${store.user.id}`}
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("Perfil Artista")}
                  </Link>
                </>
              ) : (
                <>
                  {/* Link para ir al perfil usuario */}
                  <Link
                    to={`/userProfile/${store.user?.id}`}
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("Perfil")}
                  </Link>
                </>
              )}
              {/* Opción DATOS (para ambos) */}
              <Link
                to="/userdata"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                {t("Datos")}
              </Link>
              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                {t("Cerrar sesión")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
