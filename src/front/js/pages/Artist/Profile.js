// src/front/js/pages/Artist/Profile.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import "../../../styles/Profile.css";

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

  // Estado local para la data del artista
  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio"); // Pestaña por defecto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState("");
  const [uploading, setUploading] = useState("");

  // Usuario logueado (puede venir de store o localStorage)
  const loggedUser = store.user || JSON.parse(localStorage.getItem("user") || "null");
  const isOwner = loggedUser && Number(loggedUser.id) === Number(artistId);

  useEffect(() => {
    fetchArtistData();
    // eslint-disable-next-line
  }, [artistId]);

  const fetchArtistData = async () => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/artist/profile`,
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

  // Función para refrescar la data luego de una actualización (por ejemplo, al editar la bio)
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
      if (!response.ok) throw new Error("Error al refrescar datos del artista");
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>No se encontraron datos del artista.</p>;

  // Función para manejar el cambio de imagen
  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploading(true);

      handleUploadFile(selectedFile).finally(() => {
        setUploading(false);
      });
    }
  };

  // Función para enviar el archivo al servidor
  const handleUploadFile = async (file) => {
    if (!file) {
      alert("Selecciona una imagen.");
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

      if (!response.ok) throw new Error("Error al subir la imagen");

      const data = await response.json();

      // Actualizamos la imagen en el localStorage y en el store global
      const updatedUser = { ...store.user, profile_photo: data.img };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      actions.setUser(updatedUser);

      // Actualizamos la data del perfil del artista
      setArtistData((prevData) => ({
        ...prevData,
        user: {
          ...prevData.user,
          profile_photo: data.img,
        },
      }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // Función para manejar el botón de "Seguir"
  const handleFollow = () => {
    actions.followArtist(artistId);
    // Opcional: Puedes notificar al usuario o actualizar el estado global para reflejar el cambio en SavedArtists
    alert("¡Ahora sigues a este artista!");
  };

  return (
    <>
      <Navbar />

      <div className="artist-profile-container">
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={
                artistData.user?.profile_photo || "https://placehold.co/200"
              }
              alt="Perfil de artista"
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
                  Editar foto
                </button>
                {uploading && <p>Subiendo...</p>}
              </div>
            ) : (
              <button
                className="follow-button"
                onClick={handleFollow}
              >
                Seguir
              </button>
            )}
          </div>
          <h1 className="nombre">
            {artistData.user?.fullName || "Nombre del Artista"}
          </h1>
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

export default Profile;
