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
  const [query, setQuery] = useState(""); // Definir query en el estado
  const [results, setResults] = useState([]);
  const [genre, setGenre] = useState(""); // Estado para el género (corrección)
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

    const handleSearch = async (event) => {
      const query = event.target.value;
      setQuery(query);
    
      if (query.length > 2 || genre.length > 2) {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/search?q=${query}`
          );
          const data = await response.json();
          setResults(data);
          console.log(data)
        } catch (error) {
          console.error("Error en la búsqueda:", error);
        }
      } else {
        setResults([]);
      }
    };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={homeRoute} className="navbar-brand">
          SoundCript
        </Link>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar artistas..."
            value={query}
            onChange={handleSearch}
          />
          {/* Mostrar resultados de búsqueda */}
          {results.length > 0 && (
            <div className="search-results">
              {results.map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.artist_profile_id}`}
                  className="search-item"
                >
                  <img src={artist.profile_photo} alt={artist.fullName} />
                  <span>{artist.fullName}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
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
