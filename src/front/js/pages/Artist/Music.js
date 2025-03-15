// src/front/js/pages/Artist/Music.js
import React, { useState } from "react";

export const Music = ({ data, isOwner }) => {
    const [file, setFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState("");

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
        try {
            const formData = new FormData();
            formData.append("song", file);
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/${data.user.id}/songs`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );
            if (!response.ok) throw new Error("Error al subir la canción");
            const resData = await response.json();
            setUploadedUrl(resData.media_url);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = (songId) => {
        // Aquí se llamaría a una acción para guardar la canción en favoritos
        console.log("Like a la canción:", songId);
    };

    return (
        <div>
            <h2>Música</h2>
            {isOwner && (
                <div>
                    <input type="file" accept="audio/*" onChange={handleSongChange} />
                    <button onClick={handleUpload}>Subir Canción</button>
                </div>
            )}
            <div>
                {data.songs && data.songs.length > 0 ? (
                    <ul className="song-list">
                        {data.songs.map((song) => (
                            <li key={song.id} className="song-item">
                                <span>
                                    <strong>{song.title}</strong>
                                </span>
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
            {uploadedUrl && (
                <div>
                    <p>Canción subida:</p>
                    <audio controls src={uploadedUrl}></audio>
                </div>
            )}
        </div>
    );
};
