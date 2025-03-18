// src/front/js/pages/Artist/Profile.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import "../../../styles/Profile.css";

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

  const [artistData, setArtistData] = useState(null);
  const [activeTab, setActiveTab] = useState("bio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      if (!response.ok) throw new Error("Error al refrescar datos del artista");
      const data = await response.json();
      setArtistData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Toggle Follow
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
        if (!resp.ok) throw new Error("Error al dejar de seguir");
        alert("Has dejado de seguir al artista");
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
        if (!resp.ok) throw new Error("Error al seguir al artista");
        alert("¡Ahora sigues a este artista!");
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!artistData) return <p>No se encontraron datos del artista.</p>;

  return (
    <>
      <Navbar />
      <div className="artist-profile-container">
        <div className="artist-header">
          <div className="artist-img-container">
            <img
              src={artistData.user?.profile_photo || "https://placehold.co/200"}
              alt="Perfil de artista"
              className="artist-profile-picture"
            />
            {isOwner ? (
              <p>(Aquí pondrías tu lógica de cambiar foto, etc.)</p>
            ) : (
              <button className="follow-button" onClick={handleToggleFollow}>
                {isFollowing ? "Dejar de seguir" : "Seguir"}
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
};

export default Profile;
