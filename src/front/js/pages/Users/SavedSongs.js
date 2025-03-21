// src/front/js/pages/Users/SavedSongs.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { useTranslation } from "react-i18next";
import "../../../styles/Saveds.css"; // <-- hoja de estilos unificada

export const SavedSongs = () => {
  const { store } = useContext(Context);
  const [savedSongs, setSavedSongs] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSavedSongs = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await fetch(
          `${process.env.BACKEND_URL}/api/profile/favourite/songs`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) throw new Error(t("Error al obtener canciones guardadas"));

        const data = await response.json();

        setSavedSongs(data.saved_songs || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSavedSongs();
  }, [t]);

  const removeSong = async (songId) => {
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/profile/favourite/songs/${songId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error(t("Error al eliminar la canción"));


      setSavedSongs(prev => prev.filter(song => song.song_id !== songId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="saved-songs-container">
      <h4>{t("Canciones Guardadas")}</h4>

      {savedSongs.length === 0 ? (
        <p style={{ color: "#fff", textAlign: "center" }}>
          {t("No tienes canciones guardadas.")}
        </p>
      ) : (
        <div className="saved-songs-grid">
          {savedSongs.map(song => (
            <div key={song.song_id} className="song-card">
              <h4 className="song-title">{song.song_title}</h4>
              <div className="audio-button-row">
                <audio controls src={song.song_url}>
                  {t("Tu navegador no soporta el elemento de audio.")}
                </audio>
                <button
                  className="delete-btn"
                  onClick={() => removeSong(song.song_id)}
                >
                  {t("Eliminar")}
                </button>
                </div>
              </div>
          ))}
            </div>
          )}
        </div>
      );
};

      export default SavedSongs;
