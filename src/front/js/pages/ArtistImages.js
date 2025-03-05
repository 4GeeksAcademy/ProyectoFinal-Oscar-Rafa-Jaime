import React, { useState, useEffect } from "react";

const ArtistImages = ({ artistId }) => {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  // Cargar las imágenes del artista
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const resp = await fetch(`${process.env.BACKEND_URL}/api/artist/${artistId}/photos`);
        if (!resp.ok) throw new Error("Error al obtener fotos");
        const data = await resp.json();
        setPhotos(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPhotos();
  }, [artistId]);

  // Manejar la selección del archivo
  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
      setFileUrl(URL.createObjectURL(e.target.files[0])); // Preview local
    }
  };

  // Subir la imagen a Cloudinary y guardar en la DB
  const sendFile = async () => {
    if (!file) {
      alert("Selecciona una imagen primero");
      return;
    }
    try {
      // Subir a Cloudinary
      const form = new FormData();
      form.append("img", file);

      const response = await fetch(`${process.env.BACKEND_URL}/api/img`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) throw new Error("Error al subir la imagen a Cloudinary");
      const data = await response.json();
      const uploadedUrl = data.img;

      // Guardar la URL en la DB
      const saveResp = await fetch(`${process.env.BACKEND_URL}/api/artist/${artistId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media_url: uploadedUrl, title: "Mi nueva foto" }),
      });
      if (!saveResp.ok) throw new Error("Error al guardar la foto en la DB");

      const savedPhoto = await saveResp.json();
      setPhotos((prev) => [savedPhoto, ...prev]);

      // Limpiar estados
      setFile(null);
      setFileUrl("");
      alert("Imagen subida y guardada con éxito");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  // Eliminar foto
  const handleDelete = async (photoId) => {
    try {
      const resp = await fetch(`${process.env.BACKEND_URL}/api/artist/${artistId}/photos/${photoId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Error al eliminar la foto");

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      alert("Foto eliminada con éxito");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Imágenes</h2>
      {/* Galería de imágenes en grid */}
      <div className="images-grid">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div key={photo.id} className="image-card">
              <img src={photo.media_url} alt={photo.title} />
              <p>{photo.title}</p>
              <button onClick={() => handleDelete(photo.id)}>Eliminar</button>
            </div>
          ))
        ) : (
          <p>No hay fotos disponibles.</p>
        )}
      </div>

      {/* Sección para subir nueva imagen */}
      <div className="upload-section">
        <h4>Subir Imagen (Cloudinary)</h4>
        <input
          type="file"
          accept="image/*"
          onChange={handleImgChange}
        />
        <button onClick={sendFile}>Enviar</button>
        {fileUrl && (
          <div className="preview">
            <img src={fileUrl} alt="Preview" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistImages;
