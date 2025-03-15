"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Genre, ArtistProfile, Photo, Video, Song, SavedSong, FollowArtist
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import os

from flask_jwt_extended import create_access_token, current_user, jwt_required, get_jwt_identity


import requests

# Import the Cloudinary libraries
# ==============================
import cloudinary
from cloudinary import CloudinaryImage
import cloudinary.uploader
import cloudinary.api

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

cloudinary.config(
    cloud_name= os.getenv('CLOUD_NAME'),
    api_key= os.getenv('CLOUDINARY_API_KEY'),
    api_secret= os.getenv('CLOUDINARY_API_SECRET'),
    secure= True
)


@api.route('/img', methods=["POST"])
def upload_image():
    img = request.files["img"]
    img_url = cloudinary.uploader.upload(img)
    print(img_url)
    return jsonify({"img": img_url["url"]}),200


@api.route('/infoartist', methods=["POST"])
def save_artist():
    artist_id = request.json.get('id', None)
    if artist_id:
        artist = ArtistProfile(artist_id=artist_id)
        db.session.add(artist)
        db.session.commit()
        return jsonify({"msg": "Correct info saved"})
    return jsonify({"msg": "Id usuario obligatorio"}), 400


# Creacion de usuario 
@api.route('/register', methods=['POST'])
def register():
    fullName = request.json.get('fullName', None)
    username = request.json.get('username', None)
    address = request.json.get('address', None)
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    is_artist = request.json.get(True,None)
    profile_photo = request.json.get('profile_photo', None)

    if not fullName or not username or not email or not password:
        return jsonify({"msg": "Missing required fields"}), 400
    
    if is_artist is None:
        is_artist = False 
    
    if not profile_photo:  # Verificar si llegó la imagen
        return jsonify({"msg": "Error: No se recibió la imagen"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "Email already exists"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"msg": "Username already exists"}), 400

    user = User(fullName=fullName, username=username, address=address, email=email, is_artist=is_artist, is_active=True, profile_photo=profile_photo)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User has been created"}), 201


@api.route('/login', methods=['POST'])
def generate_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    

    # Buscar al usuario por el nombre de usuario
    user = User.query.filter_by(username=username).one_or_none()

    # Verificar si el usuario existe y la contraseña es correcta
    if not user or not user.check_password(password):
        return jsonify({"message": "Wrong username or password"}), 401
    
    # Crear el token de acceso
    access_token = create_access_token(identity=user)


    # Redirigir dependiendo de si es artista o no
    if user.is_artist:
        return jsonify({
            "access_token": access_token,
            "user": user.serialize(),
            "redirect_url": f"/artist/{user.id}",
            "user": user.serialize(),
            "redirect_url": f"/artist/{user.id}"
        })
    else:
        return jsonify({
            "access_token": access_token,
            "user": user.serialize(),
            "redirect_url": f"/homeuser/{user.id}"
        })


@api.route('/profile', methods=['GET'])
@jwt_required()
def get_current_user():
    return jsonify(current_user.serialize()), 200


# @api.route('/profile/favourites', methods=['GET'])
# @jwt_required()
# def handle_user_favourites():
#     user = current_user
     
#     return jsonify({
#         "saved_songs": [fav.serialize() for fav in user.saved_song] if user.saved_song else "No hay canciones guardadas",
#         "followed_artists": [fav.serialize() for fav in user.followed_artist] if user.followed_artist else "No tienes artistas guardados"
#     }), 200

# ROUTE TO LOAD GENRES
@api.route('/getGenresapi', methods=["GET"])
def getGenresApi():
    url = "https://api.deezer.com/genre"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers = headers)
    data = response.json()
    for genre in data.get("data", []):
        if not Genre.query.filter_by(id = genre.get("id")).first():
            new_genre = Genre(id = genre.get("id"), name = genre.get("name"))
            db.session.add(new_genre)
        db.session.commit()
    return jsonify(data)

@api.route('/getGenres', methods=["GET"])
def getGenres():
    genres = Genre.query.filter(Genre.id != 0).all()
    return jsonify({"genres": [genre.serialize() for genre in genres]}), 200


# GET: Obtener videos
@api.route('/artist/<int:artist_profile_id>/videos', methods=['GET'])
@jwt_required()
def get_artist_videos(artist_profile_id):
    current_user = get_jwt_identity()

    # Obtén los videos para este artista
    videos = Video.query.filter_by(artist_profile_id=current_user).all()
    serialized_videos = [v.serialize() for v in videos]
    return jsonify(serialized_videos), 200


 # POST: Guardar nuevo video
@api.route('/artist/<int:artist_profile_id>/videos', methods=['POST'])
@jwt_required()
def create_artist_video(artist_profile_id):
    current_user = get_jwt_identity()

    artist_profile_id = current_user
    if not artist_profile_id:
        return jsonify({"msg": "Perfil de artista no encontrado"}), 404

    # Verificar que se haya enviado un archivo con la llave "video"
    if "video" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de video"}), 400

    video = request.files["video"]

    # Opción: obtener un título opcional del formulario
    title = request.form.get("title", "Sin título")
    
    try:
        # Subir el video a Cloudinary
        upload_result = cloudinary.uploader.upload(video, resource_type="video")
    except Exception as e:
        return jsonify({"msg": "Error al subir el video", "error": str(e)}), 500

    media_url = upload_result.get("url")
    duration = upload_result.get("duration")
    if not media_url:
        return jsonify({"msg": "Error al obtener la URL de Cloudinary"}), 500

    if not media_url:
        return jsonify({"msg": "media_url is required"}), 400

    # Creamos el video
    new_video = Video(
        title=title,
        media_url=media_url,
        duration=duration,
        artist_profile_id=current_user
    )
    db.session.add(new_video)
    db.session.commit()

    return jsonify(new_video.serialize()), 201


 # DELETE: Eliminar video 
@api.route('/artist/<int:artist_profile_id>/videos/<int:video_id>', methods=['DELETE'])
@jwt_required()
def delete_artist_video(artist_profile_id, video_id):
    current_user = get_jwt_identity()    
    
    video = Video.query.filter_by(id=video_id, artist_profile_id=current_user).first()
    if not video:
        return jsonify({"msg": "Video no encontrado"}), 404

    db.session.delete(video)
    db.session.commit()
    return jsonify({"msg": "Video eliminado con éxito"}), 200



 # GET: Obtener musica
@api.route('/artist/<int:artist_profile_id>/songs', methods=['GET'])
@jwt_required()
def get_artist_songs(artist_profile_id):

    current_user = get_jwt_identity()
    if not current_user:
        return jsonify({"msg": "Artista no encontrado"}), 404
    
    # Obtén la musica para este artista
    songs = Song.query.filter_by(artist_profile_id=current_user).all()
    serialized_songs = [s.serialize() for s in songs]
    return jsonify(serialized_songs), 200


 # POST: Guardar nueva musica
@api.route('/artist/<int:artist_profile_id>/songs', methods=['POST'])
@jwt_required()
def create_artist_song(artist_profile_id):
    current_user = get_jwt_identity()

    artist_profile_id = current_user
    if not artist_profile_id:
        return jsonify({"msg": "Perfil de artista no encontrado"}), 404

 # Verificar que se haya enviado un archivo con la llave "song"
    if "song" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de audio"}), 400

    song = request.files["song"]

    # Opción: obtener un título opcional del formulario
    title = request.form.get("title", "Sin título")
    
    try:
        # Subir la cancion a Cloudinary
        upload_result = cloudinary.uploader.upload(song, resource_type="video")
    except Exception as e:
        return jsonify({"msg": "Error al subir la cancion", "error": str(e)}), 500

    media_url = upload_result.get("url")
    duration = upload_result.get("duration")
    if not media_url:
        return jsonify({"msg": "Error al obtener la URL de Cloudinary"}), 500

    # Creamos la musica
    new_song = Song(
        title=title,
        media_url=media_url,
        duration=duration,
        artist_profile_id=current_user
    )
    db.session.add(new_song)
    db.session.commit()

    return jsonify(new_song.serialize()), 201

 # DELETE: Eliminar musica 
@api.route('/artist/<int:artist_profile_id>/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
def delete_artist_song(artist_profile_id, song_id):
    current_user = get_jwt_identity()

    song = Song.query.filter_by(id=song_id, artist_profile_id=current_user).first()
    if not song:
        return jsonify({"msg": "Cancion no encontrada"}), 404

    db.session.delete(song)
    db.session.commit()
    return jsonify({"msg": "Cancion eliminada con éxito"}), 200



# GET USER FAVOURITE SONGS AND ARTISTS
@api.route('/profile/favourites', methods=['GET'])
@jwt_required()
def handle_user_favourites():
    user = current_user
     
    return jsonify({
        "saved_songs": [fav.serialize() for fav in user.saved_song] if user.saved_song else "No hay canciones guardadas",
        "followed_artists": [fav.serialize() for fav in user.followed_artist] if user.followed_artist else "No tienes artistas guardados"
    }), 200


# POST USER FAVOURITE SONGS
@api.route('/profile/favourite/songs', methods=['POST'])
@jwt_required()
def handle_favourite_songs():
    current_user = get_jwt_identity()

    data = request.get_json()
    if not data or "songId" not in data:
        return jsonify({"msg": "No se recibió songId"}), 400
    print(data)
    song_id = int(data["songId"]) 
    
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"msg": "La canción no existe"}), 404
    
    # Check if the song is already favourited by the user
    existing_favourite_song = SavedSong.query.filter_by(user_id=current_user, song_id=song_id).first()

    if existing_favourite_song:
        return jsonify({"msg": "La canción ya está en favoritos"}), 400
        
    new_favourite_song = SavedSong(user_id=current_user, song_id=song_id)
    db.session.add(new_favourite_song)
    db.session.commit()
    return jsonify({"msg": "Canción añadida a favoritos con éxito", "new_favourite_song": new_favourite_song.serialize()}), 200


# DELETE USER FAVOURITE SONGS
@api.route('/profile/favourite/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
def delete_favourite_song(song_id): 
    current_user = get_jwt_identity()

    existing_favourite_song = SavedSong.query.filter_by(user_id=current_user, song_id=song_id).first()

    if existing_favourite_song is None:
        return jsonify({"error": "La canción no está en favoritos"}), 404

    db.session.delete(existing_favourite_song)
    db.session.commit()
    return jsonify({"msg": "Canción eliminada de favoritos con éxito"}), 200



# POST & DELETE FOR FOLLOWED ARTISTS
@api.route('/profile/followed/artist/<int:artist_profile_id>', methods=['POST'])
@jwt_required()
def handle_followed_artists(artist_profile_id):
      
    current_user = get_jwt_identity()

    # Find the artist profile 
    artist_profile = ArtistProfile.query.filter_by(artist_id=artist_profile_id).first()
    if not artist_profile:
        return jsonify({"error": "Perfil de artista no encontrado"}), 404

    # Check if the artist is already followed by the user
    existing_followed_artist = FollowArtist.query.filter_by(user_id=current_user, artist_profile_id=artist_profile.id).first()

    # POST
    if existing_followed_artist:
        return jsonify({"msg": "Ya sigues a este artista"}), 400
        
    new_followed_artist = FollowArtist(user_id=current_user, artist_profile_id=artist_profile.id)
    db.session.add(new_followed_artist)
    db.session.commit()
    return jsonify({"msg": "Artista seguido con éxito", "new_followed_artist": new_followed_artist.serialize()}), 200


# DELETE FOLLOWED ARTIST
@api.route('/profile/followed/artist/<int:artist_profile_id>', methods=['DELETE'])
@jwt_required()
def unfollow_artist(artist_profile_id): 
    
    current_user = get_jwt_identity()

    existing_followed_artist = FollowArtist.query.filter_by(user_id=current_user, artist_profile_id=artist_profile_id).first()

    if existing_followed_artist is None:
        return jsonify({"error": "Artista no se encuentra en favoritos"}), 404

    db.session.delete(existing_followed_artist)
    db.session.commit()
    return jsonify({"msg": "Artista dejado de seguir con éxito"}), 200



@api.route('/artist/<int:artist_profile_id>/profile', methods=['GET'])
@jwt_required()
def get_artist_profile(artist_profile_id):
    current_user = get_jwt_identity()

    artist_profile = ArtistProfile.query.filter(ArtistProfile.artist_id == current_user, ArtistProfile.id == artist_profile_id).first()

    if not artist_profile:
        return jsonify({"msg": "Perfil de artista no encontrado"}), 404

    artist_user = artist_profile.user 

    response = {
        "id": artist_profile.id,
        "name": artist_user.fullName if artist_user else "Desconocido",
        "profilePicture": artist_user.profile_photo if artist_user else None,
        "bio": artist_profile.bio or "",
        "images": [photo.serialize() for photo in artist_profile.artist_photos],
        "videos": [video.serialize() for video in artist_profile.artist_videos],
        "music": [song.serialize() for song in artist_profile.artist_songs]
     }

    return jsonify(response), 200

@api.route('/artist/<int:artist_profile_id>/images', methods=["POST"])
@jwt_required()
def create_artist_image(artist_profile_id):
    # Buscar el perfil del artista
    current_user = get_jwt_identity()
    artist_profile_id = current_user

    if not artist_profile_id:
        return jsonify({"msg": "Artista no encontrado"}), 404

    # Verificar que se haya enviado un archivo con la llave "img"
    if "img" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de imagen"}), 400

    img = request.files["img"]

    # Opción: obtener un título opcional del formulario
    title = request.form.get("title", "Sin título")

    try:
        # Subir la imagen a Cloudinary
        upload_result = cloudinary.uploader.upload(img)
    except Exception as e:
        return jsonify({"msg": "Error al subir la imagen", "error": str(e)}), 500

    media_url = upload_result.get("url")
    if not media_url:
        return jsonify({"msg": "Error al obtener la URL de Cloudinary"}), 500

    # Crear un nuevo registro en la tabla Photo
    new_photo = Photo(title=title, media_url=media_url, artist_profile_id=artist_profile_id)
    db.session.add(new_photo)
    db.session.commit()

    return jsonify(new_photo.serialize()), 201

@api.route('/artist/<int:artist_profile_id>/images', methods=["GET"])
@jwt_required()
def get_artist_images(artist_profile_id):
    current_user = get_jwt_identity()
    artist_profile_id = current_user

    if not artist_profile_id:
        return jsonify({"msg": "Artista no encontrado"}), 404

    photos = Photo.query.filter_by(artist_profile_id=artist_profile_id).all()
    return jsonify([photo.serialize() for photo in photos]), 200


@api.route('/artist/<int:artist_profile_id>/images/<int:img_id>', methods=['DELETE'])
@jwt_required()
def delete_artist_image(artist_profile_id, img_id):
    current_user = get_jwt_identity()

    img = Photo.query.filter_by(id=img_id, artist_profile_id=current_user).first()
    if not img:
        return jsonify({"msg": "Cancion no encontrada"}), 404

    db.session.delete(img)
    db.session.commit()
    return jsonify({"msg": "Cancion eliminada con éxito"}), 200

# @api.route('/artist/profile', methods=['POST'])
# @jwt_required()
# def get_artist_profile(artist_id):
#     current_user = get_jwt_identity()
#     # Buscar el usuario para obtener datos adicionales (nombre, foto, etc.)
#     artist_profile = ArtistProfile.query.filter_by(artist_id=artist_id).first()

#     response = {
#         "id": artist_id,
#         "name": user.fullName,
#         "profilePicture": user.profile_photo,
#         "bio": "" if not artist_profile else artist_profile.bio
#     #     "images": [photo.media_url for photo in artist_profile.artist_photos],
#     #     "videos": [video.media_url for video in artist_profile.artist_videos],
#     #     "music": [song.serialize() for song in artist_profile.artist_songs]
#     #
#      }

#     return jsonify(response), 200