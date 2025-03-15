// Artist images
import React, { useState, useEffect } from "react";

const ArtistImages = ({ artistData }) => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  // Función para actualizar el archivo seleccionado
  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
    }
  };

  // Función para enviar el archivo al backend
  const sendFile = async () => {
    if (!file) {
      alert("El campo de imagen es obligatorio");
      return;
    }
    try {
      const form = new FormData();
      form.append("img", file);

      const response = await fetch(`${process.env.BACKEND_URL}/api/img`, {
        method: "POST",
        body: form,
      });
      console.log(response);
      const data = await response.json();
      setFileUrl(data.img);
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  return (
    <div>
      {/* Cuadro para subir imágenes */}
      <div className="row m-5 ">
        <div className="col-12 mb-3">
          <h2 className="m-2">Imágenes </h2>
          <input
            type="file"
            className="form-control mb-2"
            accept="image/jpeg"
            onChange={handleImgChange}
          />
          <button className="btn btn-primary" onClick={sendFile}>
            Send
          </button>
        </div>
        {fileUrl !== "" ? (
          <div className="col-4">
            <img src={fileUrl} className="w-100 h-100" alt="Uploaded" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ArtistImages;
