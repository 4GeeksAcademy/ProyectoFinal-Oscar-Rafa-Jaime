// src/front/js/pages/Users/HomeUser.js
import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../store/appContext";
import { Link } from "react-router-dom";
import "../../../styles/homeUser.css";
import { Navbar } from "../../component/navbar";
import { Footer } from "../../component/footer";
import { CardGenres } from "./componentes/CardGenres";
import { useTranslation } from "react-i18next";

export const HomeUser = () => {
    const { store, actions } = useContext(Context);
    const { t } = useTranslation();

    useEffect(() => {
        actions.loadGenres();
    }, []);

    console.log(store)
    return (
        <div>
            <Navbar />
            <div className="container">
                {store.genres?.map((genre, index) => (
                    <div key={genre.id}>
                        <h1 className="genretitle mt-3">{genre.name}</h1>
                        <div className="artists row row-cols-1 row-cols-md-3 g-4">

                            {genre.artists.length > 0 ? (
                                genre.artists.map((artist) => (
                                    <CardGenres key={artist.id} {...artist} />
                                ))
                            ) : (
                                <p>{t("No hay artistas en este género")}</p>
                            )}


                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};
