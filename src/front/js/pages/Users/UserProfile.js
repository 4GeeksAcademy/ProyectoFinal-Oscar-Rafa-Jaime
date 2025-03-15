// src/front/js/pages/Users/UserProfile.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
    const navigate = useNavigate();

    // Por ejemplo, redirige automáticamente a SavedSongs
    useEffect(() => {
        navigate("/savedSongs/0");
    }, []);

    return null;
};

