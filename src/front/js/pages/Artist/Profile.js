// src/front/js/pages/Artist/Profile.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";

// Importamos los componentes de cada pestaña
import { Bio } from "./Bio";
import { Images } from "./Images";
import { Videos } from "./Videos";
import { Music } from "./Music";

import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";

export const Profile = () => {
  const { id: artistId } = useParams();
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  // Se obtiene el usuario logueado (del store o localStorage)
  const loggedUser =
    store.user || JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = loggedUser && Number(loggedUser.id) === Number(artistId);

  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio"); // Pestaña por defecto: biografía
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Llamada al endpoint para obtener el perfil completo del artista
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/artist/${artistId}/profile`,
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
        console.error(err);
        setError(err.message || "Error al cargar el perfil del artista.");
        setLoading(false);
      }
    };
    fetchArtistData();
  }, [artistId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>No se encontraron datos del artista.</p>;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Si es el dueño, puede editar sus datos (redirige a la vista de edición)
  const handleEditProfile = () => {
    navigate(`/artistData`);
  };

  return (
    <>
      <Navbar />
      <div className="artist-profile-container">
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={
                artistData.user.profile_photo ||
                "https://placehold.co/150"
              }
              alt="Perfil de artista"
              className="artist-profile-picture"
            />
            {isOwner ? (
              <button className="follow-button" onClick={handleEditProfile}>
                Editar Perfil
              </button>
            ) : (
              <button
                className="follow-button"
                onClick={() => actions.followArtist(artistId)}
              >
                Seguir
              </button>
            )}
          </div>
          <h1>{artistData.user.fullName || "Nombre del Artista"}</h1>
        </div>

        <div className="artist-tabs">
          <button
            className={activeTab === "bio" ? "active" : ""}
            onClick={() => handleTabChange("bio")}
          >
            Biografía
          </button>
          <button
            className={activeTab === "images" ? "active" : ""}
            onClick={() => handleTabChange("images")}
          >
            Imágenes
          </button>
          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => handleTabChange("videos")}
          >
            Vídeos
          </button>
          <button
            className={activeTab === "music" ? "active" : ""}
            onClick={() => handleTabChange("music")}
          >
            Música
          </button>
        </div>

        <div className="artist-content">
          {activeTab === "bio" && (
            <Bio data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "images" && (
            <Images data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "videos" && (
            <Videos data={artistData} isOwner={isOwner} />
          )}
          {activeTab === "music" && (
            <Music data={artistData} isOwner={isOwner} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

