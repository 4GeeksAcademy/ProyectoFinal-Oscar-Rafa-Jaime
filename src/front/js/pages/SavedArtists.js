import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/userProfile.css";

export const SavedArtists = () => {

    const { store, actions } = useContext(Context);

    const removeArtist = (id, artistId) => {
        actions.unfollowArtist(id, artistId);
    }


    const [artists, setArtists] = useState([
        { id: 1, name: "Artist A", image: "https://via.placeholder.com/50" },
        { id: 2, name: "Artist B", image: "https://via.placeholder.com/50" }
    ]);

    // const removeArtist = (id) => {
    //     setArtists(artists.filter(artist => artist.id !== id));
    // };

    return (
        <div className="profile-container">
            <h2>🎤 Artistas Seguidos</h2>
            <div className="options">
                <Link to="/savedSongs" className="option-button">🎵 Canciones Guardadas</Link>
                <Link to="/savedArtists" className="option-button active">🎤 Artistas Seguidos</Link>
            </div>
            {store?.followedArtists?.length === 0 ? <p>No sigues a ningún artista.</p> : (
                <ul>
                    {store?.followedArtists?.map(artist => (
                        <li key={artist.id}>
                            <img src={artist.artist_image} alt={artist.artist_name} />
                            {artist.artist_name}
                            <button onClick={() => removeArtist(artist.id)}>❌</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
