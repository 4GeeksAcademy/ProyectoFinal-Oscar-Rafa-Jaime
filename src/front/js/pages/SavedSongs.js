// src/front/js/pages/Users/SavedSongs.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../styles/userProfile.css";
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
    <div className="profile-container">
      <h2>🎵 Canciones Guardadas</h2>
      <div className="options">
        <Link to="/savedSongs/0" className="option-button active">
          🎵 Canciones Guardadas
        </Link>
        <Link to="/savedArtists/0" className="option-button">
          🎤 Artistas Seguidos
        </Link>
      </div>
      {savedSongs.length === 0 ? (
        <p>No tienes canciones guardadas.</p>
      ) : (
        <ul>
          {savedSongs.map((song) => (
            <li key={song.id}>
              {song.song_title}
              <button onClick={() => removeSong(song.song_id)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedSongs;
