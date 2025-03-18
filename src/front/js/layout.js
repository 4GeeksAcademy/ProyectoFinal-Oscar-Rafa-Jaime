// src/front/js/layout.js
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import injectContext from "./store/appContext";

// Importamos las vistas
import { Login } from "./pages/login";
import Profile from "./pages/Artist/Profile";
import { UserData } from "./pages/Artist/UserData";
import { HomeUser } from "./pages/Users/HomeUser";
import UserProfile from "./pages/Users/UserProfile"; // Actualizamos para usar el dashboard con pestañas
import { SavedArtists } from "./pages/Users/SavedArtists";
import { SavedSongs } from "./pages/Users/SavedSongs";
import "../styles/index.css"; // Puedes actualizar o agregar nuevos estilos

const Layout = () => {
    const basename = process.env.BASENAME || "";
    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop>
                <div className="layout-container">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/HomeUser/:id" element={<HomeUser />} />
                        <Route path="/UserProfile/:id" element={<UserProfile />} />
                        <Route path="/SavedSongs/:id" element={<SavedSongs />} />
                        <Route path="/SavedArtists/:id" element={<SavedArtists />} />
                        <Route path="/artist/:id" element={<Profile />} />
                        <Route path="/UserData" element={<UserData />} />
                        <Route path="*" element={<h1>Not found!</h1>} />
                    </Routes>
                </div>
            </ScrollToTop>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
