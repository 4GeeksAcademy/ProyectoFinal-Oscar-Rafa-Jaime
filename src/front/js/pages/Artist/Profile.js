// src/front/js/pages/Artist/Profile.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import "../../../styles/Profile.css";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  // Estado local para la data del artista
  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio"); // Pestaña por defecto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState("")
  const [uploading, setUploading] = useState("")
  // Usuario logueado (puede venir de store o localStorage)
  const loggedUser = store.user || JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = loggedUser && Number(loggedUser.id) === Number(artistId);

  // Al montar, traemos datos del artista
  useEffect(() => {
    fetchArtistData();
    // eslint-disable-next-line
  }, [artistId]);

  // Función para hacer GET y actualizar artistData
  const fetchArtistData = async () => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/artist/profile/${artistId}`,  // <-- OJO
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) {
        throw new Error(t("Error al obtener los datos del artista"));
      }
      const data = await response.json();
      setArtistData(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message || t("Error al cargar el perfil del artista."));
      setLoading(false);
    }
  };

  console.log(artistData)
  // Función para re-obtener los datos luego de un PUT en la bio
  const refreshArtistData = async () => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(`${process.env.BACKEND_URL}/api/artist/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(t("Error al refrescar datos del artista"));
      const data = await response.json();
      setArtistData(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Cambio de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <p>{t("Cargando...")}</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>{t("No se encontraron datos del artista.")}</p>;

  // Si es el dueño, puede editar su foto de perfil (redirige a la vista de edición)
  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploading(true);

      handleUploadFile(selectedFile).finally(() => {
        setUploading(false); // Set uploading to false after the upload is complete (either success or failure)
      });
    }
  };

  // Send file to the server
  const handleUploadFile = async (file) => {
    if (!file) {
      alert(t("Selecciona una imagen."));
      return;
    }

    const formData = new FormData();
    formData.append("img", file);

    const token = localStorage.getItem("Token");

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/img`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error(t("Error al subir la imagen"));

      const data = await response.json();

      // Update profile photo in local storage
      const updatedUser = { ...store.user, profile_photo: data.img };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update global context
      actions.setUser(updatedUser);


      // Update profile photo URL or handle accordingly
      setArtistData((prevData) => ({
        ...prevData,
        user: {
          ...prevData.user,
          profile_photo: data.img, // Assuming the server returns the image URL
        },
      }));
    } catch (error) {
      console.error(t("Error al subir la imagen:"), error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="artist-profile-container">
        {/* Encabezado */}
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={
                artistData.user?.profile_photo || "https://placehold.co/200"
              }
              alt={t("Perfil de artista")}
              className="artist-profile-picture"
            />
            {isOwner ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImgChange}
                  id="file-input"
                  style={{ display: "none" }}
                />
                <button
                  className="follow-button"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  {t("Editar foto")}
                </button>
                {uploading && <p>{t("Subiendo...")}</p>}
              </div>
            ) : (
              <button
                className="follow-button"
                onClick={() => actions.followArtist(artistId)}
              >
                {t("Seguir")}
              </button>
            )}
          </div>
          <h1 className="nombre">{artistData.user?.fullName ||  t("Nombre del Artista")}</h1>
        </div>

        {/* Tabs */}
        <div className="artist-tabs">
          <button
            className={activeTab === "bio" ? "active" : ""}
            onClick={() => handleTabChange("bio")}
          >
             {t("Biografía")}
          </button>
          <button
            className={activeTab === "images" ? "active" : ""}
            onClick={() => handleTabChange("images")}
          >
           {t("Imágenes")}
          </button>
          <button
            className={activeTab === "videos" ? "active" : ""}
            onClick={() => handleTabChange("videos")}
          >
            {t("Vídeos")}
          </button>
          <button
            className={activeTab === "music" ? "active" : ""}
            onClick={() => handleTabChange("music")}
          >
             {t("Música")}
          </button>
        </div>

        {/* Contenido según la pestaña */}
        <div className="artist-content">
          {activeTab === "bio" && (
            <Bio
              data={artistData}
              isOwner={isOwner}
              refreshArtistData={refreshArtistData}
            />
          )}
          {activeTab === "images" && <Images data={artistData} isOwner={isOwner} />}
          {activeTab === "videos" && <Videos data={artistData} isOwner={isOwner} />}
          {activeTab === "music" && <Music data={artistData} isOwner={isOwner} />}
        </div>
      </div>

      <Footer />
    </>
  );
};
