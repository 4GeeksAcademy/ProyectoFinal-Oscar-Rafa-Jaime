const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			genres: [],
			savedSongs: [],
			followedArtists: [],
		},

		actions: {
			// GET, POST, DELETE SAVED SONGS
			getSavedSongs: async () => {
				const store = getStore()
				try {
					const options = {
						method: 'GET', headers: {
							"Content-Type": "application/json",
						},
					};
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/favourites`, options);
					if (!response.ok) throw new Error("Error al obtener canciones");

					const data = await response.json();
					setStore({
						savedSongs: data.saved_songs
					});
				} catch (error) {
					console.error("Error obteniendo canciones:", error);
				}
			},
			// SAVE NEW SONG
			saveSong: async (songId) => {
				const store = getStore()
				const token = localStorage.getItem("token");
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/favourite/songs`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${token}`
						},
						body: JSON.stringify({ }),
					});

					if (!response.ok) throw new Error("Error al guardar canción");

					const data = await response.json();
					setStore({ savedSongs: [...getStore().savedSongs, data.new_favourite_song] });
				} catch (error) {
					console.error("Error guardando canción:", error);
				}
			},

			// DELETE USER SAVED SONGS
			removeSavedSong: async (songId) => {
				const store = getStore()
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/favourite/songs/${songId}`, {
						method: "DELETE",
					});

					if (!response.ok) throw new Error("Error al eliminar cancion");

					// Update store after removing song
					setStore({
						savedSongs: getStore().savedSongs.filter(song => song.id !== songId)
					});
				} catch (error) {
					console.error("Error eliminando cancion:", error);
				}
			},


			// GET, POST, DELETE FOLLOWED ARTISTS
			getFollowedArtist: async (id) => {
				const store = getStore()

				try {
					const options = {
						method: 'GET',
						headers: {
							"Content-Type": "application/json",
						},
					};
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/${id}`, options);
					if (!response.ok) throw new Error("Error al obtener artistas seguidos");

					const data = await response.json();
					setStore({
						followedArtists: data.followed_artist
					});
				} catch (error) {
					console.error("Error obteniendo artistas seguidos:", error);
				}
			},

			followArtist: async (id, artistId) => {
				const store = getStore()

				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/${id}/followed/artist/${artistId}`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({}),
					});

					if (!response.ok) throw new Error("Error al seguir al artista");

					const data = await response.json();
					setStore({ followedArtists: [...getStore().followedArtists, data.new_followed_artist] });
				} catch (error) {
					console.error("Error siguiendo al artista:", error);
				}
			},

			// UNFOLLOW ARTIST
			unfollowArtist: async (id, artistId) => {
				const store = getStore()

				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/profile/${id}/followed/artist/${artistId}`, {
						method: "DELETE",
					});

					if (!response.ok) throw new Error("Error al dejar de seguir al artista");

					setStore({
						followedArtists: getStore().followedArtists.filter(artist => artist.id !== artistId)
					});
				} catch (error) {
					console.error("Error dejando de seguir al artista:", error);
				}
			},



			// Load all genres & artists for User Home view
			loadGenres: async () => {
				const store = getStore();

				try {
					const options = {
						method: 'GET', headers: {
							"Content-Type": "application/json",
						},
					};
					const response = await fetch(`${process.env.BACKEND_URL}/api/getGenres`, options)
					if (!response.ok) {
						console.error("Fetch error loadGenres")
					}
					const data = await response.json()
					setStore({ genres: data["genres"] })
				}
				catch (error) {
					console.error("Failed to get loadGenres")
				}
			},
		}
	};
};

export default getState;
