import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
    const { store } = useContext(Context)
    console.log(store)
    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/homeuser" className="navbar-brand">SoundCript</Link>

                {/* Icono de usuario (imagen por defecto) */}
                <div className="user-menu">
                    <div className="user-icon" onClick={toggleMenu}>
                        <img src="https://cdn-icons-png.flaticon.com/512/3106/3106921.png" alt="Perfil de Usuario" />
                    </div>

                    {/* Menú desplegable */}
                    <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
                        <Link to="/userProfile" className="dropdown-item" onClick={() => setMenuOpen(false)}>Perfil</Link>
                        {store.user.artist && (
                            <Link to={`/artist/${store.user.id}`} className="dropdown-item" onClick={() => setMenuOpen(false)}>PerfilArtista</Link>
                        )}
                        <Link to="/userdata" className="dropdown-item" onClick={() => setMenuOpen(false)}>Datos</Link>
                        <Link to="/" className="dropdown-item" onClick={() => setMenuOpen(false)}>Logout</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};