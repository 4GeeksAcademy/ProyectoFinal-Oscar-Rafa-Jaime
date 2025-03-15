// src/front/js/pages/Users/HomeUser.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";
import "../../../styles/homeUser.css";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";

export const HomeUser = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.loadGenres();
    }, []);

    // Aquí puedes tener datos reales o simulados para los artistas
    const artistsMock = [
        { id: 1, song: "Song 1", name: "Artista 1", genre: "Rock", image: "https://via.placeholder.com/50" },
        { id: 2, song: "Song 2", name: "Artista 2", genre: "Rock", image: "https://via.placeholder.com/50" },
        // ...
    ];

    return (
        <div>
            <Navbar />
            <div className="container">
                {store.genres?.map((genre, index) => (
                    <div key={index}>
                        <h1 className="genretitle mt-3">{genre.name}</h1>
                        <div className="artists row row-cols-1 row-cols-md-3 g-4">
                            {artistsMock.map((artist, artistIndex) => (
                                <div key={artistIndex} className="artistcard">
                                    <div className="card">
                                        <img src={artist.image} className="card-img-top" alt={artist.name} />
                                        <div className="card-body">
                                            <h4>{artist.song}</h4>
                                            <p>{artist.name}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mb-3 mx-2">
                                            <Link className="btn btn-outline-purple" to={`/artist/${artist.id}`}>
                                                Ver perfil
                                            </Link>
                                            <button
                                                className="btn btn-outline-purple"
                                                onClick={() => actions.saveSong(artist.id)}
                                            >
                                                <i className="fa-regular fa-star"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};
