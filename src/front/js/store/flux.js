// src/front/js/store/flux.js
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			user: null,
			message: null,
			demo: [
				{ title: "FIRST", background: "white", initial: "white" },
				{ title: "SECOND", background: "white", initial: "white" }
			],
			genres: [] // Se cargarán desde el endpoint /api/getGenres
		},
		actions: {
			setUser: (user) => {
				setStore({ user: user });
			},

			loadGenres: async () => {
				try {
					const resp = await fetch(
						`${process.env.BACKEND_URL}/api/getGenres`
					);
					if (!resp.ok) throw new Error("Error en loadGenres");
					const data = await resp.json();
					setStore({ genres: data.genres });
				} catch (error) {
					console.error("Failed to load genres", error);
				}
			},
			followArtist: async (artistId) => {
				try {
					const token = localStorage.getItem("Token");
					const resp = await fetch(
						`${process.env.BACKEND_URL}/api/profile/followed/artist/${artistId}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							}
						}
					);
					if (!resp.ok) throw new Error("Error al seguir artista");
					// Actualiza el store si es necesario
				} catch (error) {
					console.error("Error following artist", error);
				}
			},
			saveSong: async (songId) => {
				try {
					const token = localStorage.getItem("Token");
					const resp = await fetch(
						`${process.env.BACKEND_URL}/api/profile/favourite/songs`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							},
							body: JSON.stringify({ songId })
						}
					);
					if (!resp.ok) throw new Error("Error al guardar canción");
					// Actualiza el store si es necesario
				} catch (error) {
					console.error("Error saving song", error);
				}
			}
			// Puedes agregar más acciones según sea necesario
		}
	};
};

export default getState;
