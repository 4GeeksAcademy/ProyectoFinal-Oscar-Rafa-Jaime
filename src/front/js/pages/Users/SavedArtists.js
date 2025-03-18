// src/front/js/pages/Users/SavedArtists.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/userProfile.css";

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
        if (!response.ok) throw new Error("Error al obtener artistas seguidos");
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
      if (!response.ok) throw new Error("No se pudo dejar de seguir al artista");

      setFollowedArtists((prev) =>
        prev.filter((artist) => artist.artist_profile_id !== artist_profile_id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="profile-container text-dark">
      <h2>🎤 Artistas Seguidos</h2>

      {followedArtists.length === 0 ? (
        <p>No sigues a ningún artista.</p>
      ) : (
        <div className="artist-grid">
          {followedArtists.map((artist) => (
            <div key={artist.artist_profile_id} className="artist-card">
              <img
                src={
                  artist.artist_image || "https://via.placeholder.com/150"
                }
                alt={artist.artist_name}
                className="artist-image"
              />
              <h4 className="artist-name">{artist.artist_name}</h4>
              <button
                className="btn btn-danger remove-btn"
                onClick={() => removeArtist(artist.artist_profile_id)}
              >
                Dejar de seguir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedArtists;
