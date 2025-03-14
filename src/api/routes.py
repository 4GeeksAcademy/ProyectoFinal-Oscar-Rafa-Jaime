import os
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, ArtistProfile, Genre, Photo, Video, Song, SavedSong, FollowArtist
from api.utils import APIException, generate_sitemap
import cloudinary
import cloudinary.uploader
from flask_cors import CORS

api = Blueprint("api", __name__)
CORS(api)
import requests
# Configuración de Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# -----------------------------------------------------------------
# Registro de usuario (puede ser artista o usuario normal)
# -----------------------------------------------------------------
@api.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    required_fields = ["fullName", "username", "email", "address", "password"]
    if not all(field in data for field in required_fields):
        raise APIException("Faltan campos obligatorios", status_code=400)
    
    if User.query.filter_by(email=data["email"]).first():
        raise APIException("Email ya registrado", status_code=400)
    if User.query.filter_by(username=data["username"]).first():
        raise APIException("Nombre de usuario ya registrado", status_code=400)
    
    is_artist = data.get("is_artist", False)
    profile_photo = data.get("profile_photo", None)
    
    user = User(
        fullName=data["fullName"],
        username=data["username"],
        email=data["email"],
        address=data["address"],
        is_artist=is_artist,
        profile_photo=profile_photo
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    
    # Si el usuario es artista, creamos un perfil de artista
    if is_artist:
        artist_profile = ArtistProfile(user_id=user.id, bio=data.get("bio", ""))
        db.session.add(artist_profile)
        db.session.commit()
    
    return jsonify({"msg": "Usuario creado exitosamente"}), 201

# -----------------------------------------------------------------
# Inicio de sesión
# -----------------------------------------------------------------
@api.route("/login", methods=["POST"])
def login():
    # Obteniendo los datos de la solicitud
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Buscando al usuario en la base de datos
    user = User.query.filter_by(username=username).first()

# Validando las credenciales
    if not user or not user.check_password(password):
        raise APIException("Credenciales inválidas", status_code=401)

    # Generando el token de acceso, usando el ID del usuario
    access_token = create_access_token(identity=user)

    # Determinando la URL de redirección según el tipo de usuario
    if user.is_artist:
        redirect_url = f"/artist/{user.id}"
    else:
        redirect_url = f"/homeuser/{user.id}"

    # Respuesta con el token de acceso, los datos del usuario y la URL de redirección
    return jsonify({
        "access_token": access_token,
        "user": user.serialize(),
        "redirect_url": redirect_url
    }), 200

# -----------------------------------------------------------------
# Obtener el perfil del usuario actual
# -----------------------------------------------------------------
@api.route("/profile", methods=["GET"])
@jwt_required()
def get_current_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)
    return jsonify(user.serialize()), 200

# -----------------------------------------------------------------
# Obtener perfil de artista (datos, multimedia y géneros)
# -----------------------------------------------------------------
@api.route("/artist/<int:artist_profile_id>/profile", methods=["GET"])
@jwt_required()
def get_artist_profile(artist_profile_id):
    # Aquí se permite que cualquier usuario autenticado vea el perfil
    artist_profile = ArtistProfile.query.filter_by(id=artist_profile_id).first()
    if not artist_profile:
        raise APIException("Perfil de artista no encontrado", status_code=404)
    return jsonify(artist_profile.serialize()), 200

# -----------------------------------------------------------------
# Endpoints para multimedia (imágenes, vídeos y canciones)
# -----------------------------------------------------------------

# Imágenes
@api.route("/artist/<int:artist_profile_id>/images", methods=["POST"])
@jwt_required()
def upload_artist_image(artist_profile_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    
    if "img" not in request.files:
        raise APIException("No se proporcionó una imagen", status_code=400)
    img = request.files["img"]
    try:
        upload_result = cloudinary.uploader.upload(img)
    except Exception as e:
        raise APIException("Error al subir la imagen: " + str(e), status_code=500)
    
    media_url = upload_result.get("url")
    if not media_url:
        raise APIException("Error al obtener la URL de la imagen", status_code=500)
    
    photo = Photo(
        title=request.form.get("title", "Sin título"),
        media_url=media_url,
        artist_profile_id=artist_profile_id
    )
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route("/artist/<int:artist_profile_id>/images", methods=["GET"])
@jwt_required()
def get_artist_images(artist_profile_id):
    photos = Photo.query.filter_by(artist_profile_id=artist_profile_id).all()
    return jsonify([photo.serialize() for photo in photos]), 200

@api.route("/artist/<int:artist_profile_id>/images/<int:img_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_image(artist_profile_id, img_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    photo = Photo.query.filter_by(id=img_id, artist_profile_id=artist_profile_id).first()
    if not photo:
        raise APIException("Imagen no encontrada", status_code=404)
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"msg": "Imagen eliminada con éxito"}), 200

# Vídeos
@api.route("/artist/<int:artist_profile_id>/videos", methods=["POST"])
@jwt_required()
def upload_artist_video(artist_profile_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    
    if "video" not in request.files:
        raise APIException("No se proporcionó un video", status_code=400)
    video_file = request.files["video"]
    try:
        upload_result = cloudinary.uploader.upload(video_file, resource_type="video")
    except Exception as e:
        raise APIException("Error al subir el video: " + str(e), status_code=500)
    
    media_url = upload_result.get("url")
    duration = upload_result.get("duration")
    if not media_url:
        raise APIException("Error al obtener la URL del video", status_code=500)
    
    video = Video(
        title=request.form.get("title", "Sin título"),
        media_url=media_url,
        duration=duration,
        artist_profile_id=artist_profile_id
    )
    db.session.add(video)
    db.session.commit()
    return jsonify(video.serialize()), 201

@api.route("/artist/<int:artist_profile_id>/videos", methods=["GET"])
@jwt_required()
def get_artist_videos(artist_profile_id):
    videos = Video.query.filter_by(artist_profile_id=artist_profile_id).all()
    return jsonify([video.serialize() for video in videos]), 200

@api.route("/artist/<int:artist_profile_id>/videos/<int:video_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_video(artist_profile_id, video_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    video = Video.query.filter_by(id=video_id, artist_profile_id=artist_profile_id).first()
    if not video:
        raise APIException("Video no encontrado", status_code=404)
    db.session.delete(video)
    db.session.commit()
    return jsonify({"msg": "Video eliminado con éxito"}), 200

# Canciones
@api.route("/artist/<int:artist_profile_id>/songs", methods=["POST"])
@jwt_required()
def upload_artist_song(artist_profile_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    
    if "song" not in request.files:
        raise APIException("No se proporcionó un archivo de audio", status_code=400)
    song_file = request.files["song"]
    try:
        # Usamos resource_type "video" para audio, si así lo configura Cloudinary
        upload_result = cloudinary.uploader.upload(song_file, resource_type="video")
    except Exception as e:
        raise APIException("Error al subir la canción: " + str(e), status_code=500)
    
    media_url = upload_result.get("url")
    duration = upload_result.get("duration")
    if not media_url:
        raise APIException("Error al obtener la URL de la canción", status_code=500)
    
    song = Song(
        title=request.form.get("title", "Sin título"),
        media_url=media_url,
        duration=duration,
        artist_profile_id=artist_profile_id
    )
    db.session.add(song)
    db.session.commit()
    return jsonify(song.serialize()), 201

@api.route("/artist/<int:artist_profile_id>/songs", methods=["GET"])
@jwt_required()
def get_artist_songs(artist_profile_id):
    songs = Song.query.filter_by(artist_profile_id=artist_profile_id).all()
    return jsonify([song.serialize() for song in songs]), 200

@api.route("/artist/<int:artist_profile_id>/songs/<int:song_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_song(artist_profile_id, song_id):
    current_user = get_jwt_identity()
    if current_user != artist_profile_id:
        raise APIException("No autorizado", status_code=401)
    song = Song.query.filter_by(id=song_id, artist_profile_id=artist_profile_id).first()
    if not song:
        raise APIException("Canción no encontrada", status_code=404)
    db.session.delete(song)
    db.session.commit()
    return jsonify({"msg": "Canción eliminada con éxito"}), 200

# -----------------------------------------------------------------
# Endpoints para el usuario: Guardar canciones y seguir artistas
# -----------------------------------------------------------------

# Guardar canción (favorita)
@api.route("/profile/favourite/songs", methods=["POST"])
@jwt_required()
def save_song():
    user_id = get_jwt_identity()
    data = request.get_json()
    song_id = data.get("songId")
    if not song_id:
        raise APIException("songId es obligatorio", status_code=400)
    if SavedSong.query.filter_by(user_id=user_id, song_id=song_id).first():
        raise APIException("La canción ya está en favoritos", status_code=400)
    new_saved = SavedSong(user_id=user_id, song_id=song_id)
    db.session.add(new_saved)
    db.session.commit()
    return jsonify(new_saved.serialize()), 200

# Eliminar canción guardada
@api.route("/profile/favourite/songs/<int:song_id>", methods=["DELETE"])
@jwt_required()
def delete_saved_song(song_id):
    user_id = get_jwt_identity()
    saved = SavedSong.query.filter_by(user_id=user_id, song_id=song_id).first()
    if not saved:
        raise APIException("Canción no encontrada en favoritos", status_code=404)
    db.session.delete(saved)
    db.session.commit()
    return jsonify({"msg": "Canción eliminada de favoritos"}), 200

# Seguir artista
@api.route("/profile/followed/artist/<int:artist_profile_id>", methods=["POST"])
@jwt_required()
def follow_artist(artist_profile_id):
    user_id = get_jwt_identity()
    if FollowArtist.query.filter_by(user_id=user_id, artist_profile_id=artist_profile_id).first():
        raise APIException("Ya sigues a este artista", status_code=400)
    new_follow = FollowArtist(user_id=user_id, artist_profile_id=artist_profile_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify(new_follow.serialize()), 200

# Dejar de seguir artista
@api.route("/profile/followed/artist/<int:artist_profile_id>", methods=["DELETE"])
@jwt_required()
def unfollow_artist(artist_profile_id):
    user_id = get_jwt_identity()
    follow = FollowArtist.query.filter_by(user_id=user_id, artist_profile_id=artist_profile_id).first()
    if not follow:
        raise APIException("No sigues a este artista", status_code=404)
    db.session.delete(follow)
    db.session.commit()
    return jsonify({"msg": "Has dejado de seguir al artista"}), 200

# -----------------------------------------------------------------
# Endpoint para obtener los géneros (para la homepage)
# -----------------------------------------------------------------
@api.route("/getGenres", methods=["GET"])
def get_genres():
    genres = Genre.query.all()
    return jsonify({"genres": [genre.serialize() for genre in genres]}), 200

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

@api.route('/img', methods=["POST"])
def upload_image():
    if "img" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de imagen"}), 400

    img = request.files["img"]

    try:
        upload_result = cloudinary.uploader.upload(img)
    except Exception as e:
        return jsonify({"msg": f"Error al subir la imagen: {str(e)}"}), 500

    print(upload_result)
    return jsonify({"img": upload_result["url"]}), 200

