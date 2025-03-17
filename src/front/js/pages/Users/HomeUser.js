// src/front/js/pages/Users/HomeUser.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";
import "../../../styles/homeUser.css";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import { CardGenres } from "./componentes/CardGenres";

export const HomeUser = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.loadGenres();
    }, []);

    // Aquí puedes tener datos reales o simulados para los artistas
    const artistsMock = [
        { id: 1, song: "Song 1", name: "Artista 1", genre: "Rock", profile_photo: "https://res.cloudinary.com/dkqwpsv60/image/upload/v1742209622/8f732da9-eb76-4b4c-9219-427f9fb3494a.png" },
        // ...
    ];

    console.log(store)
    return (
        <div>
            <Navbar />
            <div className="container">
                {store.genres?.map((genre, index) => (
                    <div key={genre.id}>
                        <h1 className="genretitle mt-3">{genre.name}</h1>
                        <div className="artists row row-cols-1 row-cols-md-3 g-4">

                            {genre.artists.length > 0 ? genre.artists.map((artist, artistIndex) => (
                                <CardGenres key={artist.id} {...artist} />
                            ))
                                : artistsMock.map(artist => (
                                    <CardGenres key={`${artist.id}-${genre.name}`} {...artist} />

                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};
