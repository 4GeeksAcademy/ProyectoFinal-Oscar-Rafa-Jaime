// src/front/js/pages/Users/SavedArtists.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../../styles/saveds.css"; // <-- tu nuevo CSS

export const SavedArtists = () => {
  const { store, actions } = useContext(Context);
  const [followedArtists, setFollowedArtists] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFollowedArtists = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/profile/followed/artist`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error(t("Error al obtener artistas seguidos"));
        }
        const data = await response.json();
        // data.followed_artists -> array con info de cada artista seguido
        setFollowedArtists(data.followed_artists || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchFollowedArtists();
  }, [t]);

  const removeArtist = async (artist_profile_id) => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/profile/followed/artist/${artist_profile_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error(t("No se pudo dejar de seguir al artista"));

      setFollowedArtists((prev) =>
        prev.filter((artist) => artist.artist_profile_id !== artist_profile_id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="saved-section container mt-4">
      <h2 className="section-title">{t("Artistas Seguidos")}</h2>

      {followedArtists.length === 0 ? (
        <p className="no-items">{t("No sigues a ningún artista.")}</p>
      ) : (
        <div className="saveds-grid">
          {followedArtists.map((artist) => (
            <div key={artist.artist_profile_id} className="saveds-card">
              <img
                src={artist.artist_image || "https://via.placeholder.com/200x200"}
                alt={artist.artist_name}
              />
              <h4>{artist.artist_name}</h4>
              <div className="btns-container">
                <Link
                  to={`/artist/${artist.artist_profile_id}`}
                  className="btn btn-visit-profile"
                >
                  {t("Ver perfil")}
                </Link>
                <button
                  className="btn btn-danger remove-btn"
                  onClick={() => removeArtist(artist.artist_profile_id)}
                >
                  {t("Dejar de seguir")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedArtists;
