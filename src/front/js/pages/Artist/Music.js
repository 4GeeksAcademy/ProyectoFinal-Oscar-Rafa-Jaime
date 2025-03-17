// src/front/js/pages/Artist/Music.js
import React, { useState } from "react";
import "../../../styles/music.css"; // Asegúrate de tener estilos para música

export const Music = ({ data, isOwner, refreshArtistData }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSongChange = (e) => {
        if (e.target.files && e.target.files.length) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona una canción.");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "SoundCript");
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/song/upload`,
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
                    }),
                }
            );
            if (!backendResponse.ok)
                throw new Error("Error al subir la canción al backend");
            await backendResponse.json();
            alert(
                "Canción subida con éxito. A continuación se recargara la página para ver los cambios."
            );
            window.location.reload();
            if (refreshArtistData) await refreshArtistData();
            setFile(null);
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
            if (!response.ok)
                throw new Error("Error al eliminar la canción");
            alert(
                "Canción eliminada. A continuación se recargara la página para ver los cambios."
            );
            window.location.reload();
            if (refreshArtistData) await refreshArtistData();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleLike = (songId) => {
        // Lógica para "like" de canción (por ejemplo, llamar a un endpoint o actualizar el estado)
        console.log("Like a la canción:", songId);
    };

    return (
        <div>
            <h2>Música</h2>
            {isOwner && (
                <div>
                    <input type="file" accept="audio/*" onChange={handleSongChange} />
                    <button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir Canción"}
                    </button>
                </div>
            )}
            <div className="music-container">
                {data.songs && data.songs.length > 0 ? (
                    <ul className="song-list">
                        {data.songs.map((song) => (
                            <li key={song.id} className="song-item">
                                <span>
                                    <strong>{song.title}</strong>
                                </span>
                                {isOwner && (
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteSong(song.id)}
                                    >
                                        X
                                    </button>
                                )}
                                {!isOwner && (
                                    <button
                                        className="like-button"
                                        onClick={() => handleLike(song.id)}
                                    >
                                        👍 Like
                                    </button>
                                )}
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
