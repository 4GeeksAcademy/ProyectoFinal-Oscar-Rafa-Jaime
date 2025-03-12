import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/userProfile.css";

export const SavedSongs = () => {
 
    const { store, actions } = useContext(Context);

    const removeSong = (userId, songId) => {
        actions.removeSavedSong(userId, songId);
    };

    // const [songs, setSongs] = useState([
    //     { id: 1, title: "Song 1", artist: "Artist A" },
    //     { id: 2, title: "Song 2", artist: "Artist B" }
    // ]);

    // const removeSong = (id) => {
    //     setSongs(songs.filter(song => song.id !== id));
    // };


    return (
        <div className="profile-container">
            <h2>🎵 Canciones Guardadas</h2>
            <div className="options">
                <Link to="/savedSongs" className="option-button active">🎵 Canciones Guardadas</Link>
                <Link to="/savedArtists" className="option-button">🎤 Artistas Seguidos</Link>
            </div>
            {store?.savedSongs?.length === 0 ? <p>No tienes canciones guardadas.</p> : (
                <ul>
                    {store?.savedSongs?.map(song => (
                        <li key={song.id}>
                            {song.title} - {artist.artist_name}
                            <button onClick={() => removeSong(userId, song.id)}>❌</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
