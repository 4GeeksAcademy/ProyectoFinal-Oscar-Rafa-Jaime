// src/front/js/pages/Users/UserData.js (por ejemplo)
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../store/appContext";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import "../../../styles/data.css";

export const UserData = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    address: "",
    bio: "",          // Solo se usará si user.is_artist es true
    profile_photo: ""
  });

  useEffect(() => {
    if (store.user) {
      setFormData({
        fullName: store.user.fullName || "",
        username: store.user.username || "",
        email: store.user.email || "",
        address: store.user.address || "",
        bio:
          store.user.artist_profile && store.user.artist_profile.bio
            ? store.user.artist_profile.bio
            : "",
        profile_photo: store.user.profile_photo || ""
      });
    }
  }, [store.user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/user/${store.user.id}`, // O la ruta que uses
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
      actions.setUser(data.user); // Actualiza el store con los datos devueltos
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
        <h1 className="text-center mb-4 text-white">
          Editar Datos del Usuario
        </h1>
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

          {store.user && store.user.is_artist && (
            <div className="mb-3">
              <label>Biografía</label>
              <textarea
                className="form-control form-control-lg"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="5"
              />
            </div>
          )}

          <div className="d-flex col-md-12 justify-content-center">
            <button type="submit" className="btn btn-danger py-2 col-md-3 me-2">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-danger py-2 col-md-3 ms-2"
              onClick={() => {
                if (store.user.is_artist) {
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
