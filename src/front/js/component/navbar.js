import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom"

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const {store, actions} = useContext(Context);

    useEffect(() => {
        console.log(store.user)
        setProfileImage(store.user.profilePhoto)
    }, [store.user]);

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
                        <img src={profileImage} alt="Perfil de Usuario" />
                    </div>

                    {/* Menú desplegable */}
                    <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
                        <Link to="/userProfile" className="dropdown-item" onClick={() => setMenuOpen(false)}>Perfil</Link>
                        <Link to={`/artist/${store.user.id}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>PerfilArtista</Link>
                        <Link to={`/userData/${store.user.id}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>Datos</Link>
                        <Link to="/" className="dropdown-item" onClick={() => setMenuOpen(false)}>Logout</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
