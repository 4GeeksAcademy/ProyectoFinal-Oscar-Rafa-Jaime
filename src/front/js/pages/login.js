// src/front/js/pages/login.js
import React, { useContext, useState, useEffect } from "react";
import "../../styles/login.css";
import microphone from "../../img/microphone.jpg";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import logo from "../../img/logo.png"

export const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgoten, setShowForgoten] = useState(false);
  const [file, setFile] = useState(null);
  const { store, actions } = useContext(Context);
  const [genres, setGenres] = useState([]);
  const [uploading, setUploading] = useState("")

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Estado para registro
  const [formulario, setFormulario] = useState({
    fullName: "",
    username: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_photo: "",
    isArtist: false,
    bio: "",
    genres: []
  });

  // Estado para login
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    console.log(e.target.selectedOptions);

    if (e.target.type === "checkbox") {
      setFormulario({
        ...formulario,
        [e.target.name]: e.target.checked
      });
    } else if (e.target.name == "genres") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => parseInt(option.value))
      setFormulario({ ...formulario, genres: selectedOptions })
    }
    else {
      setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }
  };
  console.log(formulario);

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      setFile(e.target.files[0]);
    }
  };

  const sendFile = async () => {
    if (!file) {
      alert("Selecciona una imagen.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("img", file);
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/uploadImg`,
        {
          method: "POST",
          body: formData
        }
      );
      if (!response.ok) throw new Error("Error al subir la imagen");
      const data = await response.json();
      setFormulario((prevForm) => ({
        ...prevForm,
        profile_photo: data.img
      }));
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }

    setUploading(false);

  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formulario.password !== formulario.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    if (!formulario.profile_photo) {
      alert("Sube una imagen para tu perfil.");
      return;
    }
    try {
      const dataToSend = {
        ...formulario,
        is_artist: formulario.isArtist || false
      };

      const registerResponse = await fetch(
        `${process.env.BACKEND_URL}/api/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend)
        }
      );
      const registerData = await registerResponse.json();
      if (registerResponse.ok) {
        alert("Usuario registrado con éxito");
        setShowLogin(true);
        setShowRegister(false);
        setShowForgoten(false);
      } else {
        alert(registerData.msg || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert(error.message || "Error en el servidor");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el inicio de sesión");
      }
      const data = await response.json();
      localStorage.setItem("Token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      actions.setUser(data.user);
      if (data.redirect_url) {
        navigate(data.redirect_url);
      }
    } catch (error) {
      console.error("Error al hacer fetch:", error);
      alert(error.message || "Error en el servidor");
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert("Funcionalidad de recuperación no implementada");
  };

  useEffect(() => {
    const getGenres = async () => {
      const response = await fetch(`${process.env.BACKEND_URL}/api/getGenres`)
      const data = await response.json()
      console.log(data);
      setGenres(data.genres)
    }
    getGenres();
  }, [])

  return (
    <div className="d-flex flex-column justify-content-center align-items-center"
      style={{
        backgroundImage: `url(${microphone})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <div
          className="text-center "
          style={{
            maxWidth: "400px",
            padding: "20px",
            borderRadius: "10px",
          }}
        >

          <img
            src={logo}
            alt="logo"
            className="img-fluid mb-3"
            style={{ maxHeight: "300px", width: "auto" }}
          />
        </div>
        <div
          className="login-container p-4 shadow-lg rounded-3 w-100"
          style={{ maxWidth: "400px", background: "rgba(255, 255, 255, 0.8)" }}
        >
          {!showLogin && !showRegister && !showForgoten && (
            <div>
              <h2 className="text-center text-dark mb-4">Bienvenido</h2>
              <button
                className="btn btn-danger boton w-100 mb-3"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                  setShowForgoten(false);
                }}
              >
                Iniciar sesión
              </button>
              <button
                className="btn btn-secondary w-100"
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                  setShowForgoten(false);
                }}
              >
                Registrarse
              </button>
            </div>
          )}

          {showLogin && !showForgoten && (
            <form onSubmit={handleLogin}>
              <h2 className="text-center text-dark mb-4">Iniciar sesión</h2>
              <div className="text-center mb-4"></div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre de usuario"
                  name="username"
                  value={loginData.username}
                  onChange={(e) =>
                    setLoginData({ ...loginData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Contraseña"
                  name="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger w-100 py-2">
                Ingresar
              </button>
              <div className="text-center mt-2">
                <a
                  href="#"
                  className="text-decoration-none"
                  onClick={() => setShowForgoten(true)}
                >
                  ¿He olvidado mi contraseña?
                </a>
                <button
                  type="button"
                  className="btn btn-link w-100 mt-2"
                  onClick={() => {
                    setShowForgoten(false);
                    setShowLogin(false);
                    setShowRegister(false);
                  }}
                >
                  Volver
                </button>
              </div>
            </form>
          )}

          {showRegister && (
            <form onSubmit={handleRegister}>
              <h2 className="text-center text-dark mb-4">Registro</h2>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre y apellidos"
                  name="fullName"
                  value={formulario.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre de usuario"
                  name="username"
                  value={formulario.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Correo electrónico"
                  name="email"
                  value={formulario.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Dirección"
                  name="address"
                  value={formulario.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Contraseña"
                  name="password"
                  value={formulario.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Confirmar contraseña"
                  name="confirmPassword"
                  value={formulario.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label me-2">¿Eres artista?</label>
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="isArtist"
                  checked={formulario.isArtist}
                  onChange={handleChange}
                />
                {formulario.isArtist &&
                  <select className="form-select" onChange={handleChange} name="genres" multiple>
                    {genres.map(genre => {
                      return (
                        <option value={genre.id} key={genre.id}>
                          {genre.name}
                        </option>
                      )
                    })}
                  </select>
                }
              </div>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control mb-2"
                  accept="image/jpeg, image/png"
                  onChange={handleImgChange}
                />
                <button type="button" className="boton" onClick={sendFile} disabled={uploading}>
                  {uploading ? "Subiendo..." : "Subir Imagen"}
                </button>
              </div>
              <button type="submit" className="btn btn-success w-100 py-2">
                Registrarse
              </button>
              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => setShowRegister(false)}
              >
                Volver
              </button>
            </form>
          )}

          {showForgoten && (
            <form onSubmit={handlePasswordReset}>
              <h2 className="text-center mb-4">¿He olvidado mi contraseña?</h2>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Nueva contraseña"
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                  setShowForgoten(false);
                }}
              >
                Volver
              </button>
            </form>
          )}
        </div>
        <div
          className="d-block w-100 text-center mt-3"
          style={{
            maxWidth: "1200px",
            textAlign: "center",
          }}
        >
          <h3 className="text-white fs-1 fs-md-2 fs-lg-3">
            Conecta y comparte tu talento
          </h3>
          <h1 className="text-white fs-1 fs-md-2 fs-lg-3">
            SoundCript
          </h1>
        </div>
      </div>
    </div>
  );
};
