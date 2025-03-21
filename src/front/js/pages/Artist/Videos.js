// src/front/js/pages/Artist/Videos.js
import React, { useState } from "react";
import "../../../styles/video.css";
import { useTranslation } from "react-i18next";

function Videos({ data, isOwner, refreshArtistData }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files.length) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert(t("Selecciona un vídeo."));
            return;
        }
        setUploading(true);
        try {
            // Subir a Cloudinary
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
            if (!response.ok) throw new Error(t("Error al subir el vídeo"));
            const resData = await response.json();
            const videoUrl = resData.secure_url;

            // Guardar en backend
            const token = localStorage.getItem("Token");
            const backendResponse = await fetch(
                `${process.env.BACKEND_URL}/api/artist/videos`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        video_url: videoUrl,
                        title: "Mi video subido",
                        duration: 0
                    })
                }
            );

            if (!backendResponse.ok)
                throw new Error(t("Error al subir el vídeo al backend"));
            await backendResponse.json();

            alert(t("Vídeo subido con éxito. Recargara la página para ver los cambios."));
            if (refreshArtistData) await refreshArtistData();
            setFile(null);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        setUploading(false);
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm(t("¿Estás seguro de eliminar este vídeo?"))) return;
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/videos/${videoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!response.ok)
                throw new Error(t("Error al eliminar el vídeo"));
            alert(t("Vídeo eliminado. Recargara la página para ver los cambios."));
            if (refreshArtistData) await refreshArtistData();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>{t("Vídeos")}</h2>
            {isOwner && (
                <div className="upload-section">
                    {/* Input oculto */}
                    <input
                        type="file"
                        id="videoInput"
                        style={{ display: "none" }}
                        accept="video/*"
                        onChange={handleVideoChange}
                    />
                    <label htmlFor="videoInput" className="upload-label">
                        {t("Seleccionar Vídeo")}
                    </label>
                    {file && <span className="file-name">{file.name}</span>}
                    <button onClick={handleUpload} disabled={uploading} className="upload-button">
                        {uploading ? t("Subiendo...") : t("Subir Vídeo")}
                    </button>
                </div>
            )}
            <div className="videos-container">
                {data.videos && data.videos.length > 0 ? (
                    data.videos.map((video) => (
                        <div className="video-wrapper" key={video.id}>
                            <iframe
                                width="100%"
                                height="315"
                                src={video.media_url}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            {isOwner && (
                                <button
                                    className="eliminar-button"
                                    onClick={() => handleDeleteVideo(video.id)}
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>{t("No hay vídeos disponibles.")}</p>
                )}
            </div>
        </div>
    );
}

export default Videos;
