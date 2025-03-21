import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/data.css"
import Imagen from "../../img/microphone.jpg";
import { Context } from "../store/appContext";

export const UserData = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const [showEditData, setShowEditData] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [is_artist, setIsArtist] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");



    useEffect(() => {
        console.log(store.user)
        setFullName(store.user.fullName);
        setUsername(store.user.username);
        setAddress(store.user.address);
        setEmail(store.user.email);
        setPassword(store.user.password);
        setIsArtist(store.user.is_artist);
        setProfilePhoto(store.user.profile_photo);
    }, [store.user]);

    const clickEditData = () => {
        setShowEditData(true);
    };

    const cancelEditData = (event) => {
        event.preventDefault();  
        setShowEditData(false);
    };

    return (
        <div className="container mt-4">
            <div className="card p-4 d-flex flex-row align-items-center justify-content-between" style={{ maxWidth: "100%", minHeight: "220px" }}>
                {/* Información del usuario (Izquierda) */}
                <div className="card-body">
                    <h1 className="card-title text-white">{username}</h1>
                </div>

                {/* Imagen del usuario + Botón (Derecha) */}
                <div className="d-flex flex-column align-items-center" style={{ paddingRight: "20px" }}>
                    <div style={{ width: "140px", height: "140px", overflow: "hidden", borderRadius: "50%" }}>
                        <img
                            src={profilePhoto}
                            className="img-fluid"
                            alt="Foto de perfil"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                    <button className=" boton btn btn-danger mt-3" style={{ marginBottom: "10px" }}>Editar Foto</button>
                </div>
            </div>

            {!showEditData && (
                <div className="card bg-white mt-3">
                    <h2 className="card-header">Datos Personales</h2>
                    <div className="card-body">
                        <h4 className="card-title mb-1">Nombre y apellidos</h4>
                        <p className="card-text mb-3">{fullName}</p>
                        <h4 className="card-title mb-1">Correo</h4>
                        <p className="card-text mb-3">{email}</p>
                        <h4 className="card-title mb-1">Direccion</h4>
                        <p className="card-text mb-3">{address}</p>
                        <h4 className="card-title mb-1">Artista</h4>
                        <p className="card-text mb-3">{is_artist ? "Sí" : "No"}</p>
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-danger mt-3" style={{ marginBottom: "10px" }} onClick={clickEditData}>
                                Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditData && (
                <form className="mt-4">
                    <h1 className="text-center mb-4 text-white">Editar Datos</h1>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Nombre de usuario</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Repite Contraseña</label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Dirección</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Teléfono</label>
                        <input
                            type="number"
                            className="form-control form-control-lg"
                            placeholder=""
                            required
                        />
                    </div>
                    <div className="d-flex col-md-12 justify-content-center">
                        <button type="submit" className="btn btn-danger py-2 col-md-3 me-2">
                            Guardar
                        </button>
                        <button type="button" className="btn btn-danger py-2 col-md-3 ms-2" onClick={cancelEditData}>
                            Volver
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
