from flask_sqlalchemy import SQLAlchemy

from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# USER REGISTER AND PROFILE MODEL
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    fullName = db.Column(db.String(120), unique=True, nullable=True)
    username = db.Column(db.String(120), unique=True, nullable=True)
    address = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), unique=False, nullable=False)
    is_artist = db.Column(db.Boolean, default=False)  # Check if account is artist
    is_active = db.Column(db.Boolean(), default=True)
    profile_photo = db.Column(db.String(512), nullable=True)  # Profile photo URL

    #  Relationships
    followed_artist = db.relationship('FollowArtist', backref='follow_artist')
    saved_song = db.relationship('SavedSong', backref='user')

    def __repr__(self):
        return f'<User {self.username}>'

    def artist(self):
        if self.is_artist:
            return "Si"
        else:
            return "No"

    def serialize(self):
        return {
            "id": self.id,
            "full_name": self.fullName,
            "username": self.username,
            "email": self.email,
            "address":self.address,
            "artist":self.is_artist,
            "profile_photo": self.profile_photo,
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self,password):
        return check_password_hash(self.password_hash,password)


        # ARTIST PROFILE MODEL
class ArtistProfile(db.Model):
    __tablename__ = "artist_profile"

    id = db.Column(db.Integer, primary_key=True)
    bio = db.Column(db.String(400), nullable=True)

    # Relationships
    artist_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True)

    user = db.relationship("User", backref="artist_profile")

    artist_photos = db.relationship("Photo", backref="artist_profile")
    artist_videos = db.relationship("Video", backref="artist_profile")
    artist_songs = db.relationship("Song", backref="artist_profile")

    def __repr__(self):
        return f'<ArtistProfile {self.id}>'

    def serialize(self):

        return {
            "id": self.id,
            "artist_id": self.artist_id,
            "artist_name": self.user.fullName if self.user else None,
            "profile_photo": self.user.profile_photo if self.user else None,
            "bio": self.bio,
            "artist_photos": [photo.serialize() for photo in self.artist_photos],
            "artist_videos": [video.serialize() for video in self.artist_videos],
            "artist_songs": [song.serialize() for song in self.artist_songs]
        }

# ARTIST PHOTO MODEL
class Photo(db.Model):
    __tablename__ = "photo"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.String(512), nullable=False)  # Cloudinary URL

    # Relationships
    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def __repr__(self):
        return f'<Photo {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url
        }


# ARTIST VIDEO MODEL
class Video(db.Model):
    __tablename__ = "video"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.String(512), nullable=False)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)

    # Relationships
    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def __repr__(self):
        return f'<Video {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration
        }


class Song(db.Model):
    __tablename__ = "song"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    media_url = db.Column(db.String(512), nullable=False)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)

    # Relationships
    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def __repr__(self):
        
        return f'<Song {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration        
            }


            # USER SAVED MUSIC & FOLLOW ARTIST MODEL
class SavedSong(db.Model):
    __tablename__ = "saved_song"

    id = db.Column(db.Integer, primary_key=True)

    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    song_id = db.Column(db.Integer, db.ForeignKey("song.id"))

    song = db.relationship("Song", backref="saved_song")

    def __repr__(self):
        return f'<Saved_Song {self.song_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "song_id": self.song_id,
            "title": self.song.title if self.song else "Titulo desconocido",
             }


class FollowArtist(db.Model):
    __tablename__ = "follow_artist"

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    artist_profile_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), primary_key=True)
 
    def __repr__(self):
        return f'<FollowArtist user_id={self.user_id}, artist_profile_id={self.artist_profile_id}, is_active={self.is_active}>'

    def serialize(self):
        artist_profile = ArtistProfile.query.get(self.artist_profile_id)
        artist_user = User.query.get(artist_profile.artist_id) if artist_profile else None

        return {
            "user_id": self.user_id,
            "artist_profile_id": self.artist_profile_id,
            "artist_name": artist_user.fullName if artist_user else "Artista desconocido",
            "artist_image": artist_user.profile_photo if artist_user else "Imagen no existe",
        }
    
class Genre(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), unique=True, nullable=False)

    def __repr__(self):
        return f'<Genre {self.name}>'

    def serialize(self):
        return {
          "id": self.id,
          "name": self.name
        }