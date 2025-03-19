// CardGenres.js
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const CardGenres = ({ profile_photo, name, id }) => {
      const { t } = useTranslation();
    
    return (
        <div className="artistcard">
            <div className="card">
                <img src={profile_photo} className="card-img-top" alt={name} />
                <div className="card-body">
                    <p>{name}</p>
                </div>
                <div className="d-flex justify-content-between mb-3 mx-2">
                    <Link className="btn btn-outline-purple" to={`/artist/${id}`}>
                        {t("Ver perfil")}
                    </Link>
                </div>
            </div>
        </div>
    );
};



{/* <button
                        className="btn btn-outline-purple"
                        onClick={() => actions.saveSong(id)}
                    >
                        <i className="fa-regular fa-star"></i>
                    </button> */}