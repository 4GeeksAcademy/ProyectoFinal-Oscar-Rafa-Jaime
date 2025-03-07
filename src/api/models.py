from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()

        #  USER REGISTER AND PROFILE MODEL
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)

    fullName = db.Column(db.String(120), unique=True, nullable=True)
    username = db.Column(db.String(120), unique=True, nullable=True)
    address = db.Column(db.String(120), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), unique=False, nullable=False)

    is_artist = db.Column(db.Boolean, default=False) # Check if account is artist
    is_active = db.Column(db.Boolean(), default=True)
    profile_photo = db.Column(db.String(255), nullable=True)  # Profile photo URL

    #  Relationships
    followed_artists = db.relationship('FollowArtist', backref='follow_artist')
    saved_music = db.relationship('SavedMusic', backref='user')

    def __repr__(self):
        return f'<User {self.username}>'

    def artist(is_artist):
        if is_artist:
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
            "artist":self.artist(),
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
    bio = db.Column(db.Text, nullable=True)

    # Relationships
    artist_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)

    artist_photos = db.relationship("Photo", backref="artist_profile")
    artist_videos = db.relationship("Video", backref="artist_profile")
    artist_music = db.relationship("Music", backref="artist_profile")

    def __repr__(self):
        return f'<Artist_Profile {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "artist_id": self.artist_id,
            "bio": self.bio,
            "artist_photos": self.artist_photos,
            "artist_videos": self.artist_videos,
            "artist_music": self.artist_music
        }
    
                # ARTIST PHOTO MODEL
class Photo(db.Model):
    __tablename__ = "photo"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.Text, nullable=False)  # Cloudinary URL

    # Relationships
    artist_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

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
    media_url = db.Column(db.Text, nullable=False)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)

    # Relationships
    artist_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def __repr__(self):
        return f'<Video {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration,
        }

        # GENRES MODEL TO LOAD GENRES
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
      
                # ARTIST MUSIC MODEL
class Music(db.Model):
    __tablename__ = "music"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    media_url = db.Column(db.Text, nullable=False)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)

    # Relationships
    artist_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), nullable=False)

    def __repr__(self):
        return f'<Music {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration,
        }


            # USER SAVED MUSIC & FOLLOW ARTIST MODEL
class SavedMusic(db.Model):
    __tablename__ = "saved_music"

    id = db.Column(db.Integer, primary_key=True)

    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    music_id = db.Column(db.Integer, db.ForeignKey("music.id"))

    def __repr__(self):
        return f'<Saved_Music {self.music_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "music_id": self.music_id
        }
    

                # FOLLOW ARTIST MODEL
class FollowArtist(db.Model):
    __tablename__ = "follow_artist"

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey("artist_profile.id"), primary_key=True)

    def __repr__(self):
        return f'<Follow_Artist user_id={self.user_id}, artist_id={self.artist_id}, is_active={self.is_active}>'

    def serialize(self):
        return {
            "user_id": self.user_id,
            "artist_id": self.artist_id,
        }
