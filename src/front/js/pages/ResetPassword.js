import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../component/LanguageSwitcher";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const { t } = useTranslation();

    console.log(id);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            setMessage(t("¡Las contraseñas no coinciden!"));
            setIsLoading(false);
            return;
        }

        try {
            // Make sure we're using the backend URL
            const response = await fetch(`${process.env.BACKEND_URL}/api/password-reset/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            setMessage(data.msg);

            if (response.ok) {
                setIsSuccess(true);
                // Redirect to login page after successful password reset
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (error) {
            setMessage(t("Algo salió mal. Por favor, inténtalo de nuevo."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    {/* Language Switcher */}
                    <div className="position-absolute top-0 end-0 p-3">
                        <LanguageSwitcher />
                    </div>
                    <div className="card mt-4">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">{t("Reestablece tu contraseña")}</h2>

                            {message && (
                                <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}

                            {!isSuccess && (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">{t("Nueva contraseña")}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder={t("Introduce tu nueva contraseña")}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">{t("Confirma tu nueva contraseña")}</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            placeholder={t("Confirma tu nueva contraseña")}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? t("Restableciendo...") : t("Restablecer contraseña")}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {isSuccess && (
                                <div className="text-center">
                                    <p>{t("Serás redireccionado pronto...")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="d-block w-100 text-center mt-3"
                style={{
                    maxWidth: "1200px",
                    textAlign: "center",
                }}
            >
                <h3 className="text-white fs-1 fs-md-2 fs-lg-3">
                    {t("Conecta y comparte tu talento")}
                </h3>
                <h1 className="text-white fs-1 fs-md-2 fs-lg-3">
                    SoundCript
                </h1>
            </div>
        </div>
    );
};

export default ResetPassword;