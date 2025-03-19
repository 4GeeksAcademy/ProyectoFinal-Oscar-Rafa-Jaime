// src/front/js/pages/Artist/Music.js
import React, { useState } from "react";
import "../../../styles/music.css"; // Asegúrate de tener estilos para música
import { useTranslation } from "react-i18next";
import "../../../styles/music.css";

function Music({ data, isOwner, refreshArtistData }) {
    const [file, setFile] = useState(null);
    const [songTitle, setSongTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    // Manejar selección de archivo
    const handleSongChange = (e) => {
        if (e.target.files && e.target.files.length) {
            setFile(e.target.files[0]);
        }
    };

    // Subir nueva canción (solo si isOwner)
    const handleUpload = async () => {
        if (!file) {
            alert(t("Selecciona un archivo de audio."));
            return;
        }
        if (!songTitle) {
            alert(t("Debes introducir un título para la canción."));
            return;
        }
        setUploading(true);
        try {
            // 1) Subir a Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "SoundCript");

            const cloudName = process.env.CLOUD_NAME;
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );
            if (!response.ok) throw new Error(t("Error al subir la canción"));
            const resData = await response.json();
            const songUrl = resData.secure_url;

            // 2) Guardar en backend la canción
            const token = localStorage.getItem("Token");
            const backendResponse = await fetch(
                `${process.env.BACKEND_URL}/api/artist/songs`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        song_url: songUrl,
                        title: songTitle
                    })
                }
            );
            if (!backendResponse.ok)
                throw new Error(t("Error al subir la canción al backend"));
          
            await backendResponse.json();

            alert(t("Canción subida con éxito. Recarga la vista para ver los cambios."));
          
            if (refreshArtistData) {
              await refreshArtistData();
            }

            setFile(null);
            setSongTitle("");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        setUploading(false);
    };

    // Eliminar canción (solo si isOwner)
    const handleDeleteSong = async (songId) => {
        if (!window.confirm(t("¿Estás seguro de eliminar esta canción?"))) return;
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/songs/${songId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) throw new Error(t("Error al eliminar la canción"));
            alert(t("Canción eliminada. Recarga la vista para ver los cambios."));
          
            if (refreshArtistData) {
              await refreshArtistData();
            }

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };


    // Like a una canción (si NO eres el dueño)
    const handleLike = async (songId) => {
        try {
            const token = localStorage.getItem("Token");
            const resp = await fetch(`${process.env.BACKEND_URL}/api/profile/favourite/songs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ songId })
            });
            if (!resp.ok) throw new Error(t("Error al dar like a la canción"));
            alert(t("¡Canción guardada en tus favoritos!"));
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>{t("Música")}</h2>
            {isOwner && (
                <div style={{ marginBottom: "1em" }}>
                    <input type="file" accept="audio/*" onChange={handleSongChange} />
                    <input
                        type="text"
                        placeholder={t("Título de la canción")}
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        style={{ marginRight: "0.5em" }}
                    />
                    <button onClick={handleUpload} disabled={uploading}>
                        {uploading ? t("Subiendo...") : t("Subir Canción")}
                    </button>
                </div>
            )}

            {data.songs && data.songs.length > 0 ? (
                <ul className="song-list">
                    {data.songs.map((song) => (
                        <li key={song.id} className="song-item">
                            <div className="song-content">
                                <audio controls src={song.media_url} className="audio-player">
                                    {t("Tu navegador no soporta el elemento de audio.")}
                                </audio>
                                <span className="song-title">{song.title}</span>
                            </div>

                            {isOwner ? (
                                <button
                                    className="eliminar-button"
                                    onClick={() => handleDeleteSong(song.id)}
                                >
                                    Eliminar
                                </button>
                            ) : (
                                <button className="like-button" onClick={() => handleLike(song.id)}>
                                    Like
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{t("No hay canciones disponibles.")}</p>
            )}
        </div>
    );
}

export default Music;
