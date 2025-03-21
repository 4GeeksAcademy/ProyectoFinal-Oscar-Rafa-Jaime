from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# ------------------------------
# Modelo para Usuarios
# ------------------------------
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    fullName = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    address = db.Column(db.String(250), nullable=True)
    password_hash = db.Column(db.String(512), nullable=False)
    is_artist = db.Column(db.Boolean, default=False)  # Diferencia entre usuario y artista
    profile_photo = db.Column(db.String(512), nullable=True)
    is_active = db.Column(db.Boolean, default=True)

  
    artist_profile = db.relationship("ArtistProfile", backref="user", uselist=False)
    saved_songs = db.relationship("SavedSong", backref="user")
    followed_artists = db.relationship("FollowArtist", backref="user")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "fullName": self.fullName,
            "username": self.username,
            "email": self.email,
            "address": self.address,
            "is_artist": self.is_artist,
            "profile_photo": self.profile_photo,
            "artist_profile_id":self.artist_profile.id if self.artist_profile else None
        }


# ------------------------------
# Tabla de Asociación: artista - géneros
# ------------------------------
artist_genres = db.Table('artist_genres',
    db.Column('artist_id', db.Integer, db.ForeignKey('artist_profile.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genre.id'), primary_key=True)
)

# ------------------------------
# Perfil de Artista
# ------------------------------
class ArtistProfile(db.Model):
    __tablename__ = "artist_profile"

    id = db.Column(db.Integer, primary_key=True)
    bio = db.Column(db.String(3000), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True)


    artist_photos = db.relationship("Photo", backref="artist_profile", lazy=True)
    artist_videos = db.relationship("Video", backref="artist_profile", lazy=True)
    artist_songs = db.relationship("Song", backref="artist_profile", lazy=True)

    genres = db.relationship("Genre", secondary=artist_genres, backref=db.backref("artists", lazy=True))

    def serialize(self):
        return {
            "id": self.id,
            "bio": self.bio,
            "user": self.user.serialize() if self.user else None,
            "photos": [photo.serialize() for photo in self.artist_photos],
            "videos": [video.serialize() for video in self.artist_videos],
            "songs": [song.serialize() for song in self.artist_songs],
            "genres": [genre.serialize() for genre in self.genres]
        }
    def serialize_without_genres(self):
        return {
            "id": self.id,
            "bio": self.bio,
            "profile_photo": self.user.profile_photo if self.user else None,
            "name": self.user.fullName if self.user else None,
        }


# ------------------------------
# Género Musical
# ------------------------------
class Genre(db.Model):
    __tablename__ = "genre"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), unique=True, nullable=False)

    def __repr__(self):
        return f'<Genre {self.name}>'

    def serialize(self):
        print(self.artists)
        return {
            "id": self.id,
            "name": self.name,
            "artists": [artist.serialize_without_genres() for artist in self.artists]
        }


# ------------------------------
# Multimedia: Foto, Video, Canción
# ------------------------------
class Photo(db.Model):
    __tablename__ = "photo"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.String(512), nullable=False)  # URL desde Cloudinary

    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url
        }


class Video(db.Model):
    __tablename__ = "video"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(510), nullable=False)
    media_url = db.Column(db.String(2040), nullable=False)
    duration = db.Column(db.Integer, nullable=False)

    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration
        }


class Song(db.Model):
    __tablename__ = "song"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    media_url = db.Column(db.String(512), nullable=False)
    duration = db.Column(db.Integer, nullable=False)

    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration
        }


# ------------------------------
# Guardar canciones favoritas (usuario guarda canción)
# ------------------------------
class SavedSong(db.Model):
    __tablename__ = "saved_song"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    song_id = db.Column(db.Integer, db.ForeignKey("song.id"))

    song = db.relationship("Song", backref="saved_song")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "song_id": self.song_id,
            "song_title": self.song.title if self.song else None
        }


# ------------------------------
# Seguir artistas (usuario sigue un perfil de artista)
# ------------------------------
class FollowArtist(db.Model):
    __tablename__ = "follow_artist"

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), primary_key=True)

    def serialize(self):
        return {
            "user_id": self.user_id,
            "artist_profile_id": self.artist_profile_id
        }
