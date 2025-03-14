import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Importa los componentes para cada pestaña
import ArtistBio from "./ArtistBio";
import ArtistImages from "./ArtistImages";
import ArtistVideos from "./ArtistVideos";
import ArtistMusic from "./ArtistMusic";
import { Context } from "../store/appContext";


const ArtistProfile = () => {
    // Extraemos el id del artista de la URL
    const { artistId } = useParams();
    const navigate = useNavigate();

    const {store}=useContext(Context)
    
    
    const [artistData, setArtistData] = useState(null);
    const [activeTab, setActiveTab] = useState("bio"); // Pestaña activa: biografía por defecto
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtenemos los datos del usuario logeado desde localStorage (suponiendo que lo guardaste al hacer login)
    const loggedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isOwnProfile = loggedUser && Number(loggedUser.id) === Number(artistId);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                // Se asume que tienes un endpoint en tu API para obtener el perfil de artista
                const response = await fetch(
                    `${process.env.BACKEND_URL}api/artist/${artistId}/profile`
                );
                if (!response.ok) {
                    throw new Error("Error al obtener los datos del artista");
                }
                const data = await response.json();
                setArtistData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Error al cargar el perfil del artista.");
                console.log(err)
                setLoading(false);
            }
        };

        fetchArtistData();
    }, [artistId]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;
    if (!artistData) return <p>No se encontraron datos del artista.</p>;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleEditProfile = () => {
        // Redirige a la página de edición de perfil propio, por ejemplo: /edit-artist/123
        navigate(`/edit-artist/${artistId}`);
    };

    return (
        <div className="artist-profile-container">
            {/* Encabezado del perfil */}
            <div className="artist-header">
                <div className="artist-img-container">
                    <img
                        src={artistData.profilePicture || "https://placehold.co/150"}
                        alt="Artist Profile"
                        className="artist-profile-picture"
                    />
                    {/* Si el usuario logeado es el mismo que el artista, mostramos un botón para editar el perfil */}
                    {isOwnProfile ? (
                        <button className="follow-button" onClick={handleEditProfile}>
                            Editar Perfil
                        </button>
                    ) : (
                        <button
                            className="follow-button"
                            onClick={() => console.log("Siguiendo al artista", artistData.id)}
                        >
                            Seguir
                        </button>
                    )}
                </div>
                <h1>{artistData.name}</h1>
            </div>

            {/* Menú de pestañas */}
            <div className="artist-tabs">
                <button
                    className={activeTab === "bio" ? "active" : ""}
                    onClick={() => handleTabChange("bio")}
                >
                    Biografía
                </button>
                <button
                    className={activeTab === "images" ? "active" : ""}
                    onClick={() => handleTabChange("images")}
                >
                    Imágenes
                </button>
                <button
                    className={activeTab === "videos" ? "active" : ""}
                    onClick={() => handleTabChange("videos")}
                >
                    Vídeos
                </button>
                <button
                    className={activeTab === "music" ? "active" : ""}
                    onClick={() => handleTabChange("music")}
                >
                    Música
                </button>
            </div>

            {/* Contenido según la pestaña activa */}
            <div className="artist-content">
                {activeTab === "bio" && <ArtistBio artistData={artistData} />}
                {activeTab === "images" && <ArtistImages artistData={artistData} />}
                {activeTab === "videos" && <ArtistVideos artistData={artistData} />}
                {activeTab === "music" && <ArtistMusic artistData={artistData} />}
            </div>
        </div>
    );
};

export default ArtistProfile;
