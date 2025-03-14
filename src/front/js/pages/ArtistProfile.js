import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

// Componentes para cada pestaña
import ArtistBio from "./ArtistBio";
import ArtistImages from "./ArtistImages";
import ArtistVideos from "./ArtistVideos";
import ArtistMusic from "./ArtistMusic";

import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";

const ArtistProfile = () => {
  // Obtenemos el id del artista de la URL
  const { id: artistId } = useParams();
  const navigate = useNavigate();

  // Obtenemos el usuario logueado (por ejemplo, almacenado en el store o localStorage)
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = loggedUser && Number(loggedUser.id) === Number(artistId);

  // Estado para datos del artista y pestaña activa
  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos del artista (fetch a tu API)
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await fetch(
          `${process.env.BACKEND_URL}api/artist/${artistId}/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener los datos del artista");
        }
        const data = await response.json();
        setArtistData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error al cargar el perfil del artista.");
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>No se encontraron datos del artista.</p>;

  // Manejo de cambio de pestañas
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Función para editar el perfil (para dueños)
  const handleEditProfile = () => {
    navigate(`/edit-artist/${artistId}`);
  };

  return (
    <div>
      <Navbar />

      <div className="artist-profile-container">
        {/* Encabezado del perfil */}
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={artistData.profile_photo || "https://placehold.co/150"}
              alt="Perfil de artista"
              className="artist-profile-picture"
            />
            {isOwner ? (
              <button
                className="follow-button"
                onClick={handleEditProfile}
              >
                Editar Perfil
              </button>
            ) : (
              <button
                className="follow-button"
                onClick={() => console.log("Seguir artista", artistData.id)}
              >
                Seguir
              </button>
            )}
          </div>
          <h1>{artistData.artist_name || "Nombre de Artista"}</h1>
        </div>

        {/* Menú de pestañas */}
        <div className="artist-tabs">
          <button
            onClick={() => handleTabChange("bio")}
            className={activeTab === "bio" ? "active" : ""}
          >
            Biografía
          </button>
          <button
            onClick={() => handleTabChange("images")}
            className={activeTab === "images" ? "active" : ""}
          >
            Imágenes
          </button>
          <button
            onClick={() => handleTabChange("videos")}
            className={activeTab === "videos" ? "active" : ""}
          >
            Vídeos
          </button>
          <button
            onClick={() => handleTabChange("music")}
            className={activeTab === "music" ? "active" : ""}
          >
            Música
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="artist-content">
          {activeTab === "bio" && (
            <ArtistBio data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "images" && (
            <ArtistImages data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "videos" && (
            <ArtistVideos data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "music" && (
            <ArtistMusic data={artistData} isOwner={isOwner} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistProfile;
