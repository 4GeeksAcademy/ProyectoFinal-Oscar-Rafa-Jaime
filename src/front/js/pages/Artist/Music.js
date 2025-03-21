// src/front/js/pages/Artist/Music.js
import React, { useState, useEffect } from "react";
import "../../../styles/music.css";
import { useTranslation } from "react-i18next";

function Music({ data, isOwner, refreshArtistData }) {
    const [file, setFile] = useState(null);
    const [songTitle, setSongTitle] = useState("");
    const [uploading, setUploading] = useState(false);
    const [likedSongIds, setLikedSongIds] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUserFavorites = async () => {
            try {
                const token = localStorage.getItem("Token");
                const resp = await fetch(
                    `${process.env.BACKEND_URL}/api/profile/favourite/songs`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!resp.ok) throw new Error(t("Error al obtener favoritos"));
                const data = await resp.json();
                const favoriteIds = data.saved_songs.map((s) => s.song_id);
                setLikedSongIds(favoriteIds);
            } catch (err) {
                console.error(err);
            }
        };

        if (!isOwner) {
            fetchUserFavorites();
        }
    }, [t, isOwner]);

    const handleSongChange = (e) => {
        if (e.target.files && e.target.files.length) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setSongTitle(selectedFile.name);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert(t("Seleccionar archivo"));
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
            if (!response.ok)
                throw new Error(t("Error al subir la canción"));
            const resData = await response.json();
            const songUrl = resData.secure_url;

            // 2) Guardar la canción en el backend
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
            if (!response.ok)
                throw new Error(t("Error al eliminar la canción"));
            alert(t("Canción eliminada. Recarga la vista para ver los cambios."));
            if (refreshArtistData) await refreshArtistData();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handleLikeToggle = async (songId) => {
        try {
            const token = localStorage.getItem("Token");
            if (likedSongIds.includes(songId)) {
                // Si la canción ya está en favoritos, quitarla (Dislike)
                const resp = await fetch(
                    `${process.env.BACKEND_URL}/api/profile/favourite/songs/${songId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!resp.ok)
                    throw new Error(t("Error al quitar la canción de favoritos"));
                setLikedSongIds((prev) => prev.filter((id) => id !== songId));
                alert(t("Canción eliminada de tus favoritos"));
            } else {
                // Si no está en favoritos, agregarla (Like)
                const resp = await fetch(`${process.env.BACKEND_URL}/api/profile/favourite/songs`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ songId })
                });
                if (!resp.ok) throw new Error(t("Error al dar like a la canción"));
                setLikedSongIds((prev) => [...prev, songId]);
                alert(t("¡Canción guardada en tus favoritos!"));
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>{t("Música")}</h2>
            {isOwner && (
                <div className="upload-section">
                    {/* Input oculto para seleccionar archivo */}
                    <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        accept="audio/*"
                        onChange={handleSongChange}
                    />
                    <label htmlFor="fileInput" className="upload-label">
                        {t("Seleccionar Archivo")}
                    </label>
                    {/* Input de texto para el título, que ahora se autocompleta */}
                    <input
                        type="text"
                        placeholder={t("Título de la canción")}
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="upload-input"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="upload-button"
                    >
                        {uploading ? t("Subiendo...") : t("Subir Canción")}
                    </button>
                </div>
            )}

            {data.songs && data.songs.length > 0 ? (
                <ul className="song-list">
                    {data.songs.map((song) => {
                        const isLiked = likedSongIds.includes(song.id);
                        return (
                            <li key={song.id} className="song-item">
                                <div className="song-content">
                                    <audio
                                        controls
                                        src={song.media_url}
                                        className="audio-player"
                                    >
                                        {t("Tu navegador no soporta el elemento de audio.")}
                                    </audio>
                                    <span className="song-title">{song.title}</span>
                                </div>
                                {isOwner ? (
                                    <button
                                        className="eliminar-button"
                                        onClick={() => handleDeleteSong(song.id)}
                                    >
                                        {t("Eliminar")}
                                    </button>
                                ) : (
                                    <button
                                        className={`like-button ${isLiked ? "liked" : ""}`}
                                        onClick={() => handleLikeToggle(song.id)}
                                    >
                                        {isLiked ? t("Dislike") : t("Like")}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>{t("No hay canciones disponibles.")}</p>
            )}
        </div>
    );
}

export default Music;
