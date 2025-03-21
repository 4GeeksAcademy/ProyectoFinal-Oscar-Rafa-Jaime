// src/front/js/pages/Artist/Images.js
import React, { useState } from "react";
import "../../../styles/images.css";
import { useTranslation } from "react-i18next";

function Images({ data, isOwner, refreshArtistData }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert(t("Selecciona una imagen."));
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
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );
      if (!response.ok) throw new Error(t("Error al subir imagen"));
      const resData = await response.json();
      const photoUrl = resData.secure_url;

      // 2) Guardar en backend
      const token = localStorage.getItem("Token");
      const backendResponse = await fetch(
        `${process.env.BACKEND_URL}/api/artist/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            photo_url: photoUrl,
            title: "Mi foto"
          })
        }
      );
      if (!backendResponse.ok)
        throw new Error(t("Error al subir la imagen al backend"));
      await backendResponse.json();
      alert(t("Imagen subida con éxito. Recargara la página para ver los cambios."));
      if (refreshArtistData) await refreshArtistData();
      setFile(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setUploading(false);
  };

  const handleDeleteImage = async (imgId) => {
    if (!window.confirm(t("¿Estás seguro de eliminar esta imagen?"))) return;
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/artist/images/${imgId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok)
        throw new Error(t("Error al eliminar la imagen"));
      alert(t("Imagen eliminada. Recargara la página para ver los cambios."));
      if (refreshArtistData) await refreshArtistData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>{t("Imágenes")}</h2>
      {isOwner && (
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImgChange}
            id="imgInput"
            style={{ display: "none" }}
          />
          <label htmlFor="imgInput" className="upload-label">
            {t("Seleccionar Imagen")}
          </label>
          {file && <span className="file-name">{file.name}</span>}
          <button onClick={handleUpload} disabled={uploading} className="upload-button">
            {uploading ? t("Subiendo...") : t("Subir Imagen")}
          </button>
        </div>
      )}

      <div className="images-container">
        {data.photos && data.photos.length > 0 ? (
          data.photos.map((img) => (
            <div className="image-wrapper" key={img.id}>
              <img src={img.media_url} alt={img.title} />
              {isOwner && (
                <button
                  className="eliminar-button"
                  onClick={() => handleDeleteImage(img.id)}
                >
                  X
                </button>
              )}
            </div>
          ))
        ) : (
          <p>{t("No hay imágenes disponibles.")}</p>
        )}
      </div>
    </div>
  );
}

export default Images;
