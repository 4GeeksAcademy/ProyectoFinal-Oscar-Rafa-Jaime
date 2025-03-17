// src/front/js/pages/Artist/Bio.js
import React, { useState } from "react";

export const Bio = ({ data, isOwner, refreshArtistData }) => {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(data?.bio || "");

  const handleEdit = () => setEditMode(true);

  const handleCancel = (e) => {
    e.preventDefault();
    // Restaurar la bio anterior
    setBio(data?.bio || "");
    setEditMode(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("Token");
      const resp = await fetch(`${process.env.BACKEND_URL}/api/artist/profile`, {
        method: "PUT", // O PATCH, según tu backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bio }) // Mandamos la bio nueva
      });
      if (!resp.ok) throw new Error("Error al actualizar la biografía");

      // Refrescamos la data para que se vea la nueva bio sin recargar manualmente
      await refreshArtistData();

      setEditMode(false);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error actualizando la biografía");
    }
  };

  return (
    <div>
      <h2>Biografía</h2>
      {editMode ? (
        <form onSubmit={handleSave}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="5"
            style={{ width: "100%" }}
          />
          <br />
          <button type="submit">Guardar</button>
          <button onClick={handleCancel}>Cancelar</button>
        </form>
      ) : (
        <>
          <p>{data?.bio || "No se ha definido una biografía."}</p>
          {isOwner && <button onClick={handleEdit}>Editar Biografía</button>}
        </>
      )}
    </div>
  );
};
