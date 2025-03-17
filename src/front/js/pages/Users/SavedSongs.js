import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../store/appContext";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import "../../../styles/userProfile.css";

export const SavedSongs = () => {
  const { store, actions } = useContext(Context);
  const [savedSongs, setSavedSongs] = useState([]);

  useEffect(() => {
    // ...
  }, []);

  const removeSong = async (songId) => { /* ... */ };

  return (
    <>
      <Navbar />  {/* <--- Agregas aquí */}
      
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

      <Footer /> {/* <--- Y también aquí */}
    </>
  );
};
