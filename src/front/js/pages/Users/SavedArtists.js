import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../../styles/userProfile.css";
import { Context } from "../../store/appContext";

export const SavedArtists = () => {
    const { store, actions } = useContext(Context);
    const [followedArtists, setFollowedArtists] = useState([]);

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
                    throw new Error("Error al obtener artistas seguidos");
                }
                const data = await response.json();
                // Suponiendo que la respuesta es: { followed_artists: [...] }
                setFollowedArtists(data.followed_artists || []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchFollowedArtists();
    }, []);

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
            if (!response.ok) throw new Error("Error al dejar de seguir al artista");
            setFollowedArtists(
                followedArtists.filter(
                    (artist) => artist.artist_profile_id !== artist_profile_id
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="profile-container">
            <h2>🎤 Artistas Seguidos</h2>
            <div className="options">
                <Link to="/savedSongs" className="option-button">
                    🎵 Canciones Guardadas
                </Link>
                <Link to="/savedArtists" className="option-button active">
                    🎤 Artistas Seguidos
                </Link>
            </div>
            {followedArtists.length === 0 ? (
                <p>No sigues a ningún artista.</p>
            ) : (
                <ul>
                    {followedArtists.map((artist) => (
                        <li key={artist.artist_profile_id}>
                            <img
                                src={artist.artist_image || "https://via.placeholder.com/50"}
                                alt={artist.artist_name}
                            />
                            {artist.artist_name}
                            <button onClick={() => removeArtist(artist.artist_profile_id)}>
                                ❌
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

