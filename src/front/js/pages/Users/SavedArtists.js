// src/front/js/pages/SavedArtists.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../../../styles/userProfile.css";
import { Context } from "../../store/appContext";
import { useTranslation } from "react-i18next";

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
                if (!response.ok)
                    throw new Error(t("Error al obtener artistas seguidos"));
                const data = await response.json();
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
            if (!response.ok)
                throw new Error(t("No se pudo eliminar el artista"));
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
        <div className="profile-container text-dark">
            <h2>🎤 {t("Artistas Seguidos")}</h2>

            {followedArtists.length === 0 ? (
                <p>{t("No sigues a ningún artista.")}</p>
            ) : (
                <div className="artist-grid">
                    {followedArtists.map((artist) => (
                        <div key={artist.artist_profile_id} className="artist-card">
                            <img
                                src={
                                    artist.artist_image ||
                                    "https://via.placeholder.com/150"
                                }
                                alt={artist.artist_name}
                                className="artist-image"
                            />
                            <h4 className="artist-name">{artist.artist_name}</h4>
                            <button
                                className="btn btn-danger remove-btn"
                                onClick={() => removeArtist(artist.artist_profile_id)}
                            >
                                {t("Dejar de seguir")}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedArtists;
