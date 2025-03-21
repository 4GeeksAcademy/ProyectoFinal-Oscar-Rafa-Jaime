import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import "../../../styles/data.css";
import { useTranslation } from "react-i18next";

export const UserData = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Datos de formulario
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    address: "",
    bio: "",
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (store.user) {
      setFormData({
        fullName: store.user.fullName || "",
        username: store.user.username || "",
        email: store.user.email || "",
        address: store.user.address || "",
        bio:
          store.user.is_artist && store.user.artist_profile
            ? store.user.artist_profile.bio || ""
            : "",
      });
    }
  }, [store.user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUploadImage = async () => {
    if (!file) {
      alert(t("Primero selecciona una imagen de perfil."));
      return;
    }
    setUploading(true);

    try {
      const token = localStorage.getItem("Token");
      const formData = new FormData();
      formData.append("img", file);

      const response = await fetch(`${process.env.BACKEND_URL}/api/img`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || t("Error al subir la imagen"));
      }

      const data = await response.json();

      alert(t("Imagen de perfil actualizada con éxito."));

      const updatedUser = {
        ...store.user,
        profile_photo: data.img
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      actions.setUser(updatedUser);

      setFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error(error);
      alert(error.message || t("Error subiendo la imagen de perfil."));
    }
    setUploading(false);
  };

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
        throw new Error(errData.message || t("Error al actualizar perfil"));
      }

      const data = await response.json();
      alert(t("Perfil actualizado correctamente"));

      actions.setUser(data.user);

      if (store.user.is_artist) {
        navigate(`/artist/${store.user.id}`);
      } else {
        navigate(`/userProfile/${store.user.id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || t("Error al actualizar perfil"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1 className="text-center mb-4 text-white">{t("Editar Datos del Usuario")}</h1>

        <div className="d-flex align-items-center mb-4">
          <div style={{ width: "120px", height: "120px", overflow: "hidden", borderRadius: "50%", marginRight: "20px" }}>
            <img
              src={
                previewUrl
                  ? previewUrl
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
                {t("Cambiar imagen")}
              </button>
              {/* Si se ha seleccionado un archivo, mostramos su nombre */}
              {file && (
                <div className="mt-2">
                  <small>{t("Archivo seleccionado:")} {file.name}</small>
                </div>
              )}
              <button
                type="button"
                className="boton"
                onClick={handleUploadImage}
                disabled={uploading}
              >
                {uploading ? t("Subiendo...") : t("Subir Imagen")}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>{t("Nombre completo")}</label>
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
            <label>{t("Nombre de usuario")}</label>
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
            <label>{t("Email")}</label>
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
            <label>{t("Dirección")}</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex col-md-12 justify-content-center">
            <button type="submit" className="boton">
              {t("Guardar")}
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
              {t("Volver")}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};
