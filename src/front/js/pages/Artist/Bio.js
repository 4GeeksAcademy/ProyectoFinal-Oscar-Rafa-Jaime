// src/front/js/pages/Artist/Bio.js
import React, { useState } from "react";

export const Bio = ({ data, isOwner }) => {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(data.bio || "");

  const handleEdit = () => setEditMode(true);
  const handleCancel = (e) => {
    e.preventDefault();
    setEditMode(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Aquí se llamaría a una acción o se hace un fetch para actualizar la biografía
    console.log("Guardar biografía:", bio);
    alert("Biografía actualizada (simulación)");
    setEditMode(false);
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
          <p>{bio || "No se ha definido una biografía."}</p>
          {isOwner && <button onClick={handleEdit}>Editar Biografía</button>}
        </>
      )}
    </div>
  );
};
