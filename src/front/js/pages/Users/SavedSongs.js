import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../../styles/userProfile.css";
import { Context } from "../../store/appContext";

export const SavedSongs = () => {
    const { store, actions } = useContext(Context);
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
                if (!response.ok) {
                    throw new Error("Error al obtener canciones guardadas");
                }
                const data = await response.json();
                // Suponiendo que la respuesta es: { saved_songs: [...] }
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
                <Link to="/SavedSongs/:id" className="option-button active">
                    🎵 Canciones Guardadas
                </Link>
                <Link to="/SavedArtists/:id" className="option-button">
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


