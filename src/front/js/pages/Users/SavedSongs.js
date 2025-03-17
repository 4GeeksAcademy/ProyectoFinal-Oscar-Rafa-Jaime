// src/front/js/pages/SavedSongs.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../../styles/userProfile.css";
import { Context } from "../../store/appContext";

export const SavedSongs = () => {
  const { store } = useContext(Context);
  const [savedSongs, setSavedSongs] = useState([]);

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
        if (!response.ok) throw new Error("Error al obtener canciones guardadas");
        const data = await response.json();
        setSavedSongs(data.saved_songs || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSavedSongs();
  }, []);

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
      if (!response.ok) throw new Error("Error al eliminar la canción");
      setSavedSongs(savedSongs.filter((song) => song.song_id !== songId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="profile-container text-dark">
      <h2>🎵 Canciones Guardadas</h2>
      {savedSongs.length === 0 ? (
        <p>No tienes canciones guardadas.</p>
      ) : (
        <div className="song-grid">
          {savedSongs.map((song) => (
            <div key={song.id} className="song-card">
              <h4 className="song-title">{song.song_title}</h4>
              <audio controls src={song.song_media_url || song.media_url}>
                Tu navegador no soporta el elemento de audio.
              </audio>
              <button
                className="btn btn-danger remove-btn"
                onClick={() => removeSong(song.song_id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSongs;
