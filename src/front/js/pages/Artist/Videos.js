// src/front/js/pages/Artist/Videos.js
import React, { useState } from "react";
import "../../../styles/video.css"; // Asegúrate de tener estilos para videos

export const Videos = ({ data, isOwner, refreshArtistData }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleVideoChange = (e) => {
        if (e.target.files && e.target.files.length) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona un vídeo.");
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
            if (!response.ok) throw new Error("Error al subir el vídeo");
            const resData = await response.json();
            const videoUrl = resData.secure_url;
            const token = localStorage.getItem("Token");
            const backendResponse = await fetch(
                `${process.env.BACKEND_URL}/api/artist/videos`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        video_url: videoUrl,
                    }),
                }
            );
            if (!backendResponse.ok)
                throw new Error("Error al subir el vídeo al backend");
            await backendResponse.json();
            alert(
                "Vídeo subido con éxito. Recarga la vista para ver los cambios."
            );
            if (refreshArtistData) await refreshArtistData();
            setFile(null);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
        setUploading(false);
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("¿Estás seguro de eliminar este vídeo?")) return;
        try {
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/videos/${videoId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Error al eliminar el vídeo");
            alert(
                "Vídeo eliminado. Recarga la vista para ver los cambios."
            );
            if (refreshArtistData) await refreshArtistData();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
            <h2>Vídeos</h2>
            {isOwner && (
                <div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} />
                    <button onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir Vídeo"}
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
                                    className="delete-button"
                                    onClick={() => handleDeleteVideo(video.id)}
                                >
                                    X
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No hay vídeos disponibles.</p>
                )}
            </div>
        </div>
    );
};

export default Videos;
