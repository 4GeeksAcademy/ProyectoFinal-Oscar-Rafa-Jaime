import React, { useContext, useState } from "react";
import "../../styles/login.css";
import microphone from "../../img/microphone.jpg";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  // Estados para controlar qué formulario se muestra
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgoten, setShowForgoten] = useState(false);
  const [file, setFile] = useState(null);
  const {store, actions} = useContext(Context);
  const navigate = useNavigate();
  //Estado para almacenar datos del formulario de registro

  const [formulario, setFormulario] = useState({
    fullName: "",
    username: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
    isArtist: false,
  });

  // Estados para manejar el login
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Manejar los cambios en los inputs del registro
  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setFormulario({
        ...formulario,
        [e.target.name]: e.target.checked, // Para checkbox, usamos checked
      });
    } else {
      setFormulario({ ...formulario, [e.target.name]: e.target.value });
    }
  };

  const handleImgChange = (e) => {
    if (e.target.files && e.target.files.length) {
      console.log("Imagen seleccionada:", e.target.files[0]); // 🛠️ Depuración
      setFile(e.target.files[0]);

      //Validar el tipo de archivo (por ejemplo imagen JPG o PNG)
      if (selectedFile.type !== "image/jpeg" && selectedFile.type !== "image/jpg") {
        alert("solo se permite archivos JPG y PNG");
        return;
      }
      setFile(selectedFile);
    }
  };
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
  
      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }
  
      const data = await response.json();
      console.log("URL de la imagen recibida:", data.img);
  
      // ✅ Guardar la URL en el estado del formulario
      setFormulario((prevForm) => ({
        ...prevForm,
        profilePhoto: data.img, // Asegúrate de que el campo coincida con el backend
      }));
  
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };
  

  // Manejar cambios en  los inpusts del login
  const handleLoginChange = (e) => {
    console.log("cambiar campos: ", e.target.name, "Nuevo valor:", e.target.value);
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formulario.password !== formulario.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    console.log("Formulario antes de enviar:", formulario);  // 🛠️ Depuración

    if (!formulario.profilePhoto) {
      alert("Por favor, sube una imagen antes de registrarte.");
      return;
    }

    try {
      const dataToSend = {
        ...formulario,
        isArtist: formulario.isArtist || false,
      };

      const registerResponse = await fetch("https://ideal-space-bassoon-jjqqvvv4q5g4hqpjr-3001.app.github.dev/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

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



  // Enviar formulario de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://ideal-space-bassoon-jjqqvvv4q5g4hqpjr-3001.app.github.dev/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el inicio de sesión");
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      console.log(data.user);
      actions.setUser(data.user);
      // Redirigir a la URL proporcionada en la respuesta del servidor
      if (data.user) {
        actions.setUser(data.user); // Guardar usuario en el estado global
        localStorage.setItem("user", JSON.stringify(data.user)); // Persistencia
    }

    if (data.redirect_url) {
        navigate(data.redirect_url); // Redirige sin perder el estado
    }

      // Guardar token y datos del usuario
      // localStorage.setItem("Token", data.access_token);
      // localStorage.setItem("user", JSON.stringify(data.user));
     

    } catch (error) {
      console.error("Error al hacer fetch:", error);
      alert(error.message || "Error en el servidor");
    }
  };


  return (
    <div
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
        className="login-container p-4 shadow-lg rounded-3 w-100"
        style={{ maxWidth: "400px", background: "rgba(255, 255, 255, 0.8)" }}
      >
        {/* Pantalla inicial con los botones */}
        {!showLogin && !showRegister && !showForgoten && (
          <div>
            <h2 className="text-center mb-4">Bienvenido</h2>
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

        {/* Formulario de inicio de sesión */}
        {showLogin && !showForgoten && (
          <form onSubmit={handleLogin}>
            <h2 className="text-center mb-4">Iniciar sesión</h2>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Nombre de usuario"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
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
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-danger w-100 py-2">
              Ingresar
            </button>
            <div className="text-center mt-2">
              <a href="#" className="text-decoration-none" onClick={() => setShowForgoten(true)}>
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

        {/* Formulario de registro */}
        {showRegister && (
          <form onSubmit={handleRegister}>
            <h2 className="text-center mb-4">Registro</h2>
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
            </div>
            <div className="mb-3">
              <input
                type="file"
                className="form-control mb-2"
                accept="image/jpeg"
                onChange={handleImgChange}
              />
              <button type="button" onClick={sendFile}>Subir Imagen</button>
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

        {/* Formulario de recuperar contraseña */}
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
    </div>
  );
}
