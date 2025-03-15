// src/front/js/layout.js
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import injectContext from "./store/appContext";

// Importamos las vistas
import { Login } from "./pages/login";
import { Profile } from "./pages/Artist/Profile";
import { UserData } from "./pages/Artist/UserData";
import { HomeUser } from "./pages/Users/HomeUser";
import { UserProfile } from "./pages/Users/UserProfile";
import { SavedSongs } from "./pages/Users/SavedSongs";
import { SavedArtists } from "./pages/Users/SavedArtists";
// Puedes agregar más rutas según necesites

const Layout = () => {
    const basename = process.env.BASENAME || "";
    return (
        <BrowserRouter basename={basename}>
            <ScrollToTop>
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
            </ScrollToTop>
        </BrowserRouter>
    );
};

export default injectContext(Layout);
