// src/front/js/pages/Artist/UserData.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import "../../../styles/data.css";

export const UserData = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  // Datos de formulario
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    address: "",
    // Si el usuario es artista y quieres editar su bio también, podrías agregar:
    bio: "",
  });

  // Estados para manejo de imagen de perfil
  const [file, setFile] = useState(null);     // archivo seleccionado
  const [previewUrl, setPreviewUrl] = useState(""); // url de previsualización
  const [uploading, setUploading] = useState(false); // indicador de "subiendo..."

  // Cargar datos iniciales desde store.user
  useEffect(() => {
    if (store.user) {
      setFormData({
        fullName: store.user.fullName || "",
        username: store.user.username || "",
        email: store.user.email || "",
        address: store.user.address || "",
        // Si es artista y quieres manejar su bio:
        bio:
          store.user.is_artist && store.user.artist_profile
            ? store.user.artist_profile.bio || ""
            : "",
      });
    }
  }, [store.user]);

  // Actualizar campos de texto
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar la selección del archivo de imagen
  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Crear una URL para previsualizar
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  // Subir la imagen de perfil
  const handleUploadImage = async () => {
    if (!file) {
      alert("Primero selecciona una imagen de perfil.");
      return;
    }
    setUploading(true);

    try {
      const token = localStorage.getItem("Token");
      const formData = new FormData();
      formData.append("img", file);

      // Endpoint que sube la imagen (ajusta la ruta si es diferente)
      const response = await fetch(`${process.env.BACKEND_URL}/api/img`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al subir la imagen");
      }

      const data = await response.json();

      // Notificar al usuario
      alert("Imagen de perfil actualizada con éxito.");

      // Actualizar user en store (para que se vea el cambio en Navbar y otros sitios)
      const updatedUser = {
        ...store.user,
        profile_photo: data.img
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      actions.setUser(updatedUser);

      // Limpiar el file y preview
      setFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error subiendo la imagen de perfil.");
    }
    setUploading(false);
  };

  // Guardar cambios de datos (PUT a /api/user/:id)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/user/${store.user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error al actualizar perfil");
      }

      const data = await response.json();
      alert("Perfil actualizado correctamente");

      // Actualizar store.user
      actions.setUser(data.user);

      // Redirigir según sea artista o no
      if (store.user.is_artist) {
        navigate(`/artist/${store.user.id}`);
      } else {
        navigate(`/userProfile/${store.user.id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al actualizar perfil");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center mb-4 text-white">Editar Datos del Usuario</h1>

        {/* Contenedor con foto de perfil y botón para elegir archivo */}
        <div className="d-flex align-items-center mb-4">
          <div style={{ width: "120px", height: "120px", overflow: "hidden", borderRadius: "50%", marginRight: "20px" }}>
            <img
              src={
                previewUrl
                  ? previewUrl // si hay preview local, usarla
                  : store.user?.profile_photo || "https://placehold.co/120"
              }
              alt="Foto de perfil"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              id="profileImageInput"
              style={{ display: "none" }}
            />
            <div className="image-buttons">
              <button
                type="button"
                className="boton"
                onClick={() => document.getElementById("profileImageInput").click()}
              >
                Cambiar imagen
              </button>
              {/* Si se ha seleccionado un archivo, mostramos su nombre */}
              {file && (
                <div className="mt-2">
                  <small>Archivo seleccionado: {file.name}</small>
                </div>
              )}
              <button
                type="button"
                className="boton"
                onClick={handleUploadImage}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          </div>
        </div>

        {/* Formulario para los datos de usuario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nombre completo</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Nombre de usuario</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Dirección</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Si el user es artista y quieres editar su bio, puedes mostrar: */}
          {store.user?.is_artist && (
            <div className="mb-3">
              <label>Biografía</label>
              <textarea
                className="form-control"
                rows={5}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="d-flex col-md-12 justify-content-center">
            <button type="submit" className="boton">
              Guardar
            </button>
            <button
              type="button"
              className="boton"
              onClick={() => {
                if (store.user?.is_artist) {
                  navigate(`/artist/${store.user.id}`);
                } else {
                  navigate(`/userProfile/${store.user.id}`);
                }
              }}
            >
              Volver
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};
