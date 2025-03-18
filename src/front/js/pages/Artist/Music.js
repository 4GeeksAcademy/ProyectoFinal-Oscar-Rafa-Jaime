// src/front/js/pages/Artist/Music.js
import React, { useState } from "react";
import "../../../styles/music.css";

export const Music = ({ data, isOwner, refreshArtistData }) => {
    const [file, setFile] = useState(null);
    const [songTitle, setSongTitle] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleSongChange = (e) => {
        if (e.target.files && e.target.files.length) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona un archivo de audio.");
            return;
        }
        if (!songTitle) {
            alert("Debes introducir un título para la canción.");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "SoundCript");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/video/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!response.ok) throw new Error("Error al subir la canción");
            const resData = await response.json();
            const songUrl = resData.secure_url;

            const token = localStorage.getItem("Token");
            const backendResponse = await fetch(
                `${process.env.BACKEND_URL}/api/artist/songs`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        song_url: songUrl,
                        title: songTitle,
                        duration: resData.duration || 0 // O ajusta según tu API
                    }),
                }
            );
            if (!backendResponse.ok)
                throw new Error("Error al subir la canción al backend");
            await backendResponse.json();

            alert(
                "Canción subida con éxito. Recarga la vista para ver los cambios."
            );
            window.location.reload();
            if (refreshArtistData) await refreshArtistData();

            setFile(null);
            setSongTitle("");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        setUploading(false);
    };

    const handleDeleteSong = async (songId) => {
        if (!window.confirm("¿Estás seguro de eliminar esta canción?")) return;
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/songs/${songId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Error al eliminar la canción");
            alert("Canción eliminada. Recarga la vista para ver los cambios.");
            window.location.reload();
            if (refreshArtistData) await refreshArtistData();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleLike = async (songId) => {
        try {
            const token = localStorage.getItem("Token");
            await actions.saveSong(songId);
            alert("Canción agregada a tus favoritos");
        } catch (error) {
            console.error("Error guardando la canción:", error);
            alert("Error guardando la canción");
        }
    };

    return (
        <div>
            <h2>Música</h2>
            {isOwner ? (
                <div style={{ marginBottom: "1em" }}>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleSongChange}
                        style={{ marginRight: "0.5em" }}
                    />
                    <input
                        type="text"
                        placeholder="Título de la canción"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        style={{ marginRight: "0.5em" }}
                    />
                    <button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir Canción"}
                    </button>
                </div>
            ) : null}

            <div className="music-container">
                {data.songs && data.songs.length > 0 ? (
                    <ul className="song-list">
                        {data.songs.map((song) => (
                            <li key={song.id} className="song-item">
                                <div className="song-content">
                                    <audio controls src={song.media_url}>
                                        Tu navegador no soporta el elemento de audio.
                                    </audio>
                                    <span className="song-title">{song.title}</span>
                                </div>
                                <div className="song-actions">
                                    {isOwner ? (
                                        <button
                                            className="btn btn-danger eliminar-button"
                                            onClick={() => handleDeleteSong(song.id)}
                                        >
                                            X
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-success like-button"
                                            onClick={() => handleLike(song.id)}
                                        >
                                            👍 Like
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay canciones disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Music;
