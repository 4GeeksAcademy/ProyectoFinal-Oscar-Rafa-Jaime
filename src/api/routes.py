import os
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, ArtistProfile, Genre, Photo, Video, Song, SavedSong, FollowArtist
from api.utils import APIException, generate_sitemap
import cloudinary
import cloudinary.uploader
from flask_cors import CORS

from datetime import timedelta

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))

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
    
    if is_artist:
        artist_profile = ArtistProfile(user_id=user.id, bio=data.get("bio", ""))
        genre_ids = data.get("genres", [])
        for genre_id in genre_ids: 
            genre = Genre.query.get(genre_id)
            if genre: 
                artist_profile.genres.append(genre)
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

    user = User.query.filter_by(username=username).first()

# Validando las credenciales
    if not user or not user.check_password(password):
        raise APIException("Credenciales inválidas", status_code=401)

    access_token = create_access_token(identity=user)

    if user.is_artist:
        redirect_url = f"/artist/{user.id}"
    else:
        redirect_url = f"/homeuser/{user.id}"

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
@api.route("/artist/profile", methods=["GET"])
@jwt_required()
def get_artist_profile():
    user_id = get_jwt_identity()
    artist_profile = ArtistProfile.query.filter_by(user_id=user_id).first()
    if not artist_profile:
        raise APIException("Perfil de artista no encontrado", status_code=404)
    return jsonify(artist_profile.serialize()), 200

# -----------------------------------------------------------------
# Endpoints para multimedia (imágenes, vídeos y canciones)
# -----------------------------------------------------------------

# Imágenes
@api.route("/artist/images", methods=["POST"])
@jwt_required()
def upload_artist_image():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()
    data = request.get_json()

    photo_url = data.get("photo_url")
    if not photo_url:
        raise APIException("No existe URL de imagen", status_code=400)
   
    photo = Photo(
        title=data.get("title", "Sin título"),
        media_url=photo_url,
        artist_profile_id=artist_profile_id.id
    )
 
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.serialize()), 201

@api.route("/artist/images", methods=["GET"])
@jwt_required()
def get_artist_images():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()
   
    photos = Photo.query.filter_by(artist_profile_id=artist_profile_id.id).all()
    return jsonify([photo.serialize() for photo in photos]), 200

@api.route("/artist/images/<int:img_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_image(img_id):
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()

    photo = Photo.query.filter_by(id=img_id, artist_profile_id=artist_profile_id.id).first()
    if not photo:
        raise APIException("Imagen no encontrada", status_code=404)
    
    db.session.delete(photo)
    db.session.commit()
    return jsonify({"msg": "Imagen eliminada con éxito"}), 200

# Vídeos
@api.route("/artist/videos", methods=["POST"])
@jwt_required()
def upload_artist_video():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()
    data = request.get_json()

    video_url = data.get("video_url")
    if not video_url:
        raise APIException("No existe URL de video", status_code=400)
   
    video = Video(
        title=data.get("title", "Sin título"),
        media_url=video_url,
        duration=data.get("duration", 0),
        artist_profile_id=artist_profile_id.id
    )
    db.session.add(video)
    db.session.commit()
    return jsonify(video.serialize()), 201

@api.route("/artist/videos", methods=["GET"])
@jwt_required()
def get_artist_videos():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()

    videos = Video.query.filter_by(artist_profile_id=artist_profile_id.id).all()
    return jsonify([video.serialize() for video in videos]), 200

@api.route("/artist/videos/<int:video_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_video(video_id):
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()

    video = Video.query.filter_by(id=video_id, artist_profile_id=artist_profile_id.id).first()
    if not video:
        raise APIException("Video no encontrado", status_code=404)
    
    db.session.delete(video)
    db.session.commit()
    return jsonify({"msg": "Video eliminado con éxito"}), 200

# Canciones
@api.route("/artist/songs", methods=["POST"])
@jwt_required()
def upload_artist_song():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()
    data = request.get_json()
    
    song_url = data.get("song_url")
    if not song_url:
        raise APIException("No existe URL de cancion", status_code=400)
   
    song = Song(
        title=data.get("title", "Sin título"),
        media_url=song_url,
        duration=data.get("duration", 0),
        artist_profile_id=artist_profile_id.id
    )

    db.session.add(song)
    db.session.commit()
    return jsonify(song.serialize()), 201

@api.route("/artist/songs", methods=["GET"])
@jwt_required()
def get_artist_songs():
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()

    songs = Song.query.filter_by(artist_profile_id=artist_profile_id.id).all()
    return jsonify([song.serialize() for song in songs]), 200

@api.route("/artist/songs/<int:song_id>", methods=["DELETE"])
@jwt_required()
def delete_artist_song(song_id):
    current_user = get_jwt_identity()
    artist_profile_id = ArtistProfile.query.filter_by(user_id=current_user).first()

    song = Song.query.filter_by(id=song_id, artist_profile_id=artist_profile_id.id).first()
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
    return jsonify({"genres": [genre.serialize() for genre in genres][1:]}), 200

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
@jwt_required()
def upload_image():
    current_user = get_jwt_identity()
    current_user = User.query.filter_by(id=current_user).first() 

    if "img" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de imagen"}), 400

    img = request.files["img"]

    try:
        upload_result = cloudinary.uploader.upload(img)

            # Update the profile photo in the database
        current_user.profile_photo = upload_result["url"]
        db.session.commit()  # Save the changes to the database


    except Exception as e:
        return jsonify({"msg": f"Error al subir la imagen: {str(e)}"}), 500
    
    return jsonify({"img": upload_result["url"]}), 200



@api.route("/artist/profile", methods=["PUT"])
@jwt_required()
def update_artist_profile():
    user_id = get_jwt_identity()
    artist_profile = ArtistProfile.query.filter_by(user_id=user_id).first()
    if not artist_profile:
        raise APIException("Perfil de artista no encontrado", status_code=404)
    
    data = request.get_json()
    if "bio" not in data:
        raise APIException("No se proporcionó la biografía", status_code=400)
    
    artist_profile.bio = data["bio"]
    db.session.commit()
    return jsonify(artist_profile.serialize()), 200

@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    
    data = request.get_json()

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"msg": "No autorizado para modificar este usuario"}), 403

    user.fullName = data.get("fullName", user.fullName)
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.address = data.get("address", user.address)
    
    db.session.commit()

    return jsonify({"user": user.serialize()}), 200

# Subir foto de perfil en registro de usuario
@api.route('/uploadImg', methods=["POST"])
def upload_temp_image():
    if "img" not in request.files:
        return jsonify({"msg": "No se proporcionó un archivo de imagen"}), 400

    img = request.files["img"]

    try:
        upload_result = cloudinary.uploader.upload(img)
        return jsonify({"img": upload_result["url"]}), 200
    except Exception as e:
        return jsonify({"msg": f"Error al subir la imagen: {str(e)}"}), 500

@api.route("/artist/profile/<int:artist_id>", methods=["GET"])
def get_artist_profile_by_id(artist_id):
    artist_profile = ArtistProfile.query.filter_by(id=artist_id).first()
    if not artist_profile:
        raise APIException("Perfil de artista no encontrado", status_code=404)
    return jsonify(artist_profile.serialize()), 200


@api.route("/profile/followed/artist", methods=["GET"])
@jwt_required()
def get_followed_artists():
    user_id = get_jwt_identity()
    followed = FollowArtist.query.filter_by(user_id=user_id).all()
    results = []
    for f in followed:
        artist_profile = ArtistProfile.query.get(f.artist_profile_id)
        if artist_profile and artist_profile.user:
            results.append({
                "artist_profile_id": artist_profile.id,
                "artist_name": artist_profile.user.fullName,
                "artist_image": artist_profile.user.profile_photo
            })
    return jsonify({"followed_artists": results}), 200


@api.route("/profile/favourite/songs", methods=["GET"])
@jwt_required()
def get_saved_songs():
    user_id = get_jwt_identity()
    saved = SavedSong.query.filter_by(user_id=user_id).all()
    results = []
    for s in saved:
        if s.song:
            results.append({
                "song_id": s.song.id,
                "song_title": s.song.title,
                "song_url": s.song.media_url,
                "artist_name": s.song.artist_profile.user.fullName 
                    if s.song.artist_profile and s.song.artist_profile.user else "",
                "artist_id": s.song.artist_profile.id 
                    if s.song.artist_profile else None
            })
    return jsonify({"saved_songs": results}), 200

@api.route("/artist/profile/<int:user_id>", methods=["GET"])
def get_artist_profile_by_user_id(user_id):
    """
    Devuelve el perfil de artista cuyo user_id sea <user_id>.
    """
    artist_profile = ArtistProfile.query.filter_by(user_id=user_id).first()
    if not artist_profile:
        raise APIException("Perfil de artista no encontrado", status_code=404)
    return jsonify(artist_profile.serialize()), 200

@api.route("/search", methods=["GET"])
def search_artists():
    query = request.args.get("q", "").lower()

    artists_query = User.query.filter(User.fullName.ilike(f"%{query}%"),User.is_artist==True).all()


    # Convertir artistas a JSON
    results = [
        # {
        #     "id": artist.id,
        #     "fullName": artist.fullName,
        #     "username": artist.username,
        #     "profile_photo": artist.profile_photo or "https://cdn-icons-png.flaticon.com/512/3106/3106921.png",
        #     "artist_profile_id":artist.artist_profile_id
        # }
        artist.serialize()
        for artist in artists_query
    ]

    return jsonify(results)



# Email sending route
@api.route('/sendEmail', methods=['POST'])
def send_email():
    data = request.get_json()
    to = data.get("to")

    user = User.query.filter_by(email=to).first()
    if user is None:
        return jsonify({"msg": "Email not found"}), 400

    reset_link = f"{os.getenv('FRONTEND_URL')}/password-reset/{user.id}"

    message = Mail(
        from_email='soundcript@outlook.com',
        to_emails=to,
        subject='Password Reset Request',
        html_content=f'<strong>Click <a href="{reset_link}">here</a> to reset your password.</strong>')
    print("BACKEND_URL:", os.getenv('BACKEND_URL'))

    try:
        response = sg.send(message)

        return jsonify({"msg": "Password reset link sent to your email!",
            "status_code": response.status_code,
            "body": response.body.decode() if response.body else "no body"}), 200
    except Exception as e:
        print(str(e))


@api.route('/password-reset/<int:id>', methods=['PUT'])
def password_reset(id):
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"msg": "User not found"}), 404

        data = request.get_json()
        new_password = data.get("password")

        if not new_password:
            return jsonify({"msg": "New password is required"}), 400

        user.set_password(new_password)
        db.session.commit()

        return jsonify({"msg": "Password reset successful"}), 200

    except Exception as e:
        print(e)
        return jsonify({"msg": "Invalid or expired token"}), 400