// src/front/js/pages/Artist/Images.js
import React, { useState } from "react";

export const Images = ({ data, isOwner }) => {
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona una imagen.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "SoundCript")
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData
      })
      if (!response.ok) throw new Error("Error al subir imagen")
      const resData = await response.json()
      console.log(resData);
      const photoUrl = resData.secure_url
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
                photo_url: photoUrl
              })
          }
      );
      if (!backendResponse.ok) throw new Error("Error al subir la imagen");
      const savedPhoto = await backendResponse.json();
      // setUploadedUrl(resData.media_url);
  } catch (error) {
      console.error(error);
  }
};


  return (
    <div>
      <h2>Imágenes</h2>
      {isOwner && (
        <div>
          <input type="file" accept="image/*" onChange={handleImgChange} />
          <button onClick={handleUpload}>Subir Imagen</button>
        </div>
      )}
      <div className="images-container">
        {data.photos && data.photos.length > 0 ? (
          data.photos.map((img) => (
            <img key={img.id} src={img.media_url} alt={img.title} />
          ))
        ) : (
          <p>No hay imágenes disponibles.</p>
        )}
      </div>
      {uploadedUrl && (
        <div>
          <p>Imagen subida:</p>
          <img src={uploadedUrl} alt="Nueva imagen" style={{ width: "200px" }} />
        </div>
      )}
    </div>
  );
};
