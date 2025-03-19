// src/front/js/pages/UserProfile.js
import React, { useState } from "react";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import SavedSongs from "./SavedSongs";
import SavedArtists from "./SavedArtists";
import "../../../styles/userProfile.css"; // Asegúrate de tener estilos para organizar la vista
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  // Estado para controlar qué vista se muestra:
  // "songs" para Canciones guardadas o "artists" para Artistas seguidos
  const [activeView, setActiveView] = useState("songs");
  const { t } = useTranslation();

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-4 text-center">{t("Mi Perfil")}</h1>
        {/* Botones o pestañas para cambiar de vista */}
        <div className="profile-options d-flex justify-content-center mb-4">
          <button
            className={`btn mx-2 ${activeView === "songs" ? "btn-danger" : "btn-secondary"}`}
            onClick={() => handleViewChange("songs")}
          >
            {t("Canciones Guardadas")}
          </button>
          <button
            className={`btn mx-2 ${activeView === "artists" ? "btn-danger" : "btn-secondary"}`}
            onClick={() => handleViewChange("artists")}
          >
            {t("Artistas Seguidos")}
          </button>
        </div>

        {/* Renderizado condicional según la vista activa */}
        {activeView === "songs" ? <SavedSongs /> : <SavedArtists />}
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
