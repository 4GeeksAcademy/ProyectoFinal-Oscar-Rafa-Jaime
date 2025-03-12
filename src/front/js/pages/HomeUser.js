import React, { useState, useEffect } from "react";
import { useContext } from 'react';
import { Context } from "../store/appContext";
import "../../styles/homeUser.css"

export const HomeUser = () => {

    const { store, actions } = useContext(Context);

    const newArtistFollowed = (id, artistId) => {
        actions.followArtist(id, artistId)
    }

    const newLikedSong = (userId, songId) => {
        actions.saveSong(userId, songId)
    }

    useEffect(() => {
        actions.loadGenres(); // Fetch genres when component mounts
    }, []);


    const artist = [
        { id: 1, song: 'Song 1', name: 'Artista 1', genre: 'Rock', image: 'https://placehold.co/50' },
        { id: 2, song: 'Song 2', name: 'Artista 2', genre: 'Rock', image: 'https://placehold.co/50' },

        { id: 3, song: 'Song 3', name: 'Artista 3', genre: 'Pop', image: 'https://placehold.co/50' },
        { id: 4, song: 'Song 4', name: 'Artista 4', genre: 'Pop', image: 'https://placehold.co/50' },

        { id: 5, song: 'Song 5', name: 'Artista 5', genre: 'Jazz', image: 'https://placehold.co/50' },
        { id: 6, song: 'Song 6', name: 'Artista 6', genre: 'Jazz', image: 'https://placehold.co/50' },
        // More artists...
    ]


    return (
        <div className="container">

            {store.genres?.map((g, index) => {
                return (
                    <div key={index}>
                        <h1 className="genretitle mt-3">{g.name}</h1><br />
                        <div className="artists row row-cols-1 row-cols-md-3 g-4">

                            {artist?.map((artist, artistIndex) => {

                                return (
                                    <div key={artistIndex} className="artistcard">
                                        <div className="card">
                                            <img src={artist.image} className="card-img-top" alt={artist.name} />
                                            <div className="card-body">
                                                <h4>{artist.song}</h4>
                                                <p>{artist.name}</p>
                                            </div>
                                            <div className="d-flex justify-content-between mb-3 mx-2">
                                                <button type="button" className="followbtn btn-outline-purple"
                                                    onClick={() => newArtistFollowed(artist.name)}>
                                                    Seguir artista
                                                </button>
                                                <button type="button" className="followbtn btn-outline-purple"
                                                    onClick={() => newLikedSong(artist.song)}>
                                                    <i className="fa-regular fa-star"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}
