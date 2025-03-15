// src/front/js/pages/Artist/Videos.js
import React, { useState } from "react";

export const Videos = ({ data, isOwner }) => {
    const [file, setFile] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState("");

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
        try {
            const formData = new FormData();
            formData.append("video", file);
            const token = localStorage.getItem("Token");
            const response = await fetch(
                `${process.env.BACKEND_URL}/api/artist/${data.user.id}/videos`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );
            if (!response.ok) throw new Error("Error al subir el video");
            const resData = await response.json();
            setUploadedUrl(resData.media_url);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2>Vídeos</h2>
            {isOwner && (
                <div>
                    <input type="file" accept="video/*" onChange={handleVideoChange} />
                    <button onClick={handleUpload}>Subir Vídeo</button>
                </div>
            )}
            <div className="videos-container">
                {data.videos && data.videos.length > 0 ? (
                    data.videos.map((video) => (
                        <div key={video.id} className="video-wrapper">
                            <iframe
                                width="560"
                                height="315"
                                src={video.media_url}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ))
                ) : (
                    <p>No hay vídeos disponibles.</p>
                )}
            </div>
            {uploadedUrl && (
                <div>
                    <p>Vídeo subido:</p>
                    <iframe
                        width="560"
                        height="315"
                        src={uploadedUrl}
                        title="Nuevo vídeo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
};


