// src/front/js/component/navbar.js
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/navbar.css";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    actions.setUser(null);
    navigate("/");
  };

  // Determinamos la ruta de "home" según el tipo de usuario.
  // Por ejemplo, si es artista redirigimos a /artist/{id}, si no a /homeuser/{id}
  const homeRoute = store.user
    ? (store.user.is_artist ? `/artist/${store.user.id}` : `/homeuser/${store.user.id}`)
    : "/";

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={homeRoute} className="navbar-brand">
          SoundCript
        </Link>
        <div className="user-menu">
          <div className="user-icon" onClick={toggleMenu}>
            <img
              src={
                store.user && store.user.profile_photo
                  ? store.user.profile_photo
                  : "https://cdn-icons-png.flaticon.com/512/3106/3106921.png"
              }
              alt="Perfil de Usuario"
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
                  Perfil Artista
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
                  Perfil
                </Link>
              </>
            )}
            {/* Opción DATOS (para ambos) */}
            <Link
              to="/userdata"
              className="dropdown-item"
              onClick={() => setMenuOpen(false)}
            >
              Datos
            </Link>
            <button
              className="dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
