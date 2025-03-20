// src/front/js/pages/Artist/Profile.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import "../../../styles/Profile.css";
import { useTranslation } from "react-i18next";

import { Bio } from "./Bio";
import Images from "./Images";
import Videos from "./Videos";
import Music from "./Music";

import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";

const Profile = () => {
  const { id: artistId } = useParams();
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  const { t } = useTranslation();

  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState("")
  const [uploading, setUploading] = useState("")

  // Para saber si estoy siguiendo
  const [isFollowing, setIsFollowing] = useState(false);

  const loggedUser = store.user || JSON.parse(localStorage.getItem("user") || "null");
  const isOwner =
    loggedUser &&
    loggedUser.is_artist === true &&
    Number(loggedUser.id) === Number(artistId);

  useEffect(() => {
    fetchArtistData();
    checkIfFollowing();
    // eslint-disable-next-line
  }, [artistId]);

  const checkIfFollowing = async () => {
    try {
      const token = localStorage.getItem("Token");
      // 1) Trae la lista de artistas que sigue
      const resp = await fetch(`${process.env.BACKEND_URL}/api/profile/followed/artist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!resp.ok) throw new Error("Error consultando si sigue al artista");
      const data = await resp.json();

      // data.followed_artists => un array con "artist_profile_id" por ejemplo
      // Compruebas si el "artistId" actual está en la lista
      const found = data.followed_artists?.some(
        (a) => Number(a.artist_profile_id) === Number(artistId)
      );
      setIsFollowing(found);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Token");

      let url = "";
      if (isOwner) {
        url = `${process.env.BACKEND_URL}/api/artist/profile`;
      } else {
        url = `${process.env.BACKEND_URL}/api/artist/profile/${artistId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

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

  const refreshArtistData = async () => {
    try {
      const token = localStorage.getItem("Token");
      let url = "";
      if (isOwner) {
        url = `${process.env.BACKEND_URL}/api/artist/profile`;
      } else {
        url = `${process.env.BACKEND_URL}/api/artist/profile/${artistId}`;
      }

      const response = await fetch(url, {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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

  if (loading) return <p>{t("Cargando...")}</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>{t("No se encontraron datos del artista.")}</p>;

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


      // Toggle Follow

    };
  }

  const handleToggleFollow = async () => {
    try {
      const token = localStorage.getItem("Token");
      if (isFollowing) {
        // Unfollow
        const resp = await fetch(
          `${process.env.BACKEND_URL}/api/profile/followed/artist/${artistId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!resp.ok) throw new Error(t("Error al dejar de seguir"));
        alert(t("Has dejado de seguir al artista"));
        setIsFollowing(false);
      } else {
        // Follow
        const resp = await fetch(
          `${process.env.BACKEND_URL}/api/profile/followed/artist/${artistId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!resp.ok) throw new Error(t("Error al seguir al artista"));
        alert(t("¡Ahora sigues a este artista!"));
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="artist-profile-container">
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={artistData.user?.profile_photo || "https://placehold.co/200"}
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
              <button className="follow-button" onClick={handleToggleFollow}>
                {isFollowing ? t("Dejar de seguir") : t("Seguir")}
              </button>
            )}
          </div>
          <h1 className="nombre">
            {artistData.user?.fullName || t("Nombre del Artista")}
          </h1>
        </div>

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

        <div className="artist-content">
          {activeTab === "bio" && (
            <Bio data={artistData} isOwner={isOwner} refreshArtistData={refreshArtistData} />
          )}
          {activeTab === "images" && (
            <Images data={artistData} isOwner={isOwner} refreshArtistData={refreshArtistData} />
          )}
          {activeTab === "videos" && (
            <Videos data={artistData} isOwner={isOwner} refreshArtistData={refreshArtistData} />
          )}
          {activeTab === "music" && (
            <Music data={artistData} isOwner={isOwner} refreshArtistData={refreshArtistData} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
export default Profile;
