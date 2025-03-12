import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState("");

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const userId = localStorage.getItem("userId"); // Asegúrate de tener el ID del usuario
                const response = await fetch(`https://tuapi.com/usuarios/${userId}`);
                const data = await response.json();

                if (data.profileImageUrl) { // Ajusta el nombre según tu API
                    setProfileImage(data.profileImageUrl);
                }
            } catch (error) {
                console.error("Error al obtener la imagen de perfil:", error);
            }
        };

        fetchProfileImage();
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand">SoundCript</Link>

                {/* Icono de usuario (imagen por defecto) */}
                <div className="user-menu">
                    <div className="user-icon" onClick={toggleMenu}>
                        <img src="https://cdn-icons-png.flaticon.com/512/3106/3106921.png" alt="Perfil de Usuario" />
                    </div>

                    {/* Menú desplegable */}
                    <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
                        <Link to="/userProfile" className="dropdown-item" onClick={() => setMenuOpen(false)}>Perfil</Link>
                        <Link to="/artist/2" className="dropdown-item" onClick={() => setMenuOpen(false)}>PerfilArtista</Link>
                        <Link to="/userdata" className="dropdown-item" onClick={() => setMenuOpen(false)}>Datos</Link>
                        <Link to="/" className="dropdown-item" onClick={() => setMenuOpen(false)}>Logout</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
