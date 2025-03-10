from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)


    # ADD TO USER TABLE!!
    profile_photo_id = db.Column(db.Integer, db.ForeignKey('profile_photo.id'))
    profile_photo = db.relationship('Profile_Photo', backref='user', uselist=False)

    saved_artist = db.relationship('Saved_Artist', backref='user')
    saved_music = db.relationship('Saved_Music', backref='user')


    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "saved_artist": [saved.serialize() for saved in self.saved_artist],
            "saved_music": [saved.serialize() for saved in self.saved_music],
                   # do not serialize the password, its a security breach
        }


class Artist(db.Model):
    __tablename__ = "artist"  # <--- Asegúrate de que coincida con la FK "artist.id"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    # Relación con las imágenes (photos)
    profile_photo_id = db.Column(db.Integer, db.ForeignKey('profile_photo.id'))
    profile_photo = db.relationship('Profile_Photo', backref='artist', uselist=False)
    artist_photos = db.relationship("Photo", backref="artist")
    artist_videos = db.relationship("Video", backref="artist")
    artist_music = db.relationship("Music", backref="artist")
    saved_artist = db.relationship('Saved_Artist', backref='artist')

    def __repr__(self):
        return f'<Artist {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "artist_photos": [photo.serialize() for photo in self.artist_photos]
        }

    
    #  PROFILE PHOTO CLASS MODEL
class Profile_Photo(db.Model):
    __tablename__ = "profile_photo"
    
    id = db.Column(db.Integer, primary_key=True)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    user_profile_photo = db.Column(db.String(255), nullable=True, unique=True)  # img URL or file path
    artist_profile_photo = db.Column(db.String(255), nullable=True, unique=True)  # img URL or file path

    entity_type = db.Column(db.String(50), nullable=False)  # 'user' or 'artist'

    def __repr__(self):
        return f'<ProfilePhoto {self.id, self.user_profile_photo, self.artist_profile_photo}>'

    def serialize(self):
        data = {
        "id": self.id,
        "is_active": self.is_active,
        }
        if self.user_profile_photo:
            data["user_profile_photo"] = self.user_profile_photo
        if self.artist_profile_photo:
            data["artist_profile_photo"] = self.artist_profile_photo
        return data

    # ARTIST POSTS CLASS
class Photo(db.Model):
    __tablename__ = "photo"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.Text, nullable=False, unique=True)  # Cloudinary URL

    artist_id = db.Column(db.Integer, db.ForeignKey("artist.id"), nullable=False)

    def __repr__(self):
        return f'<Photo {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url
        }


class Video(db.Model):
    __tablename__ = "video"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    media_url = db.Column(db.Text, nullable=False, unique=True)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)  # Duration in seconds

    artist_id = db.Column(db.Integer, db.ForeignKey("artist.id"), nullable=False)

    def __repr__(self):
        return f'<Video {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration,
        }

class Music(db.Model):
    __tablename__ = "music"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    media_url = db.Column(db.Text, nullable=False, unique=True)  # Cloudinary URL
    duration = db.Column(db.Integer, nullable=False)  # Duration in seconds

    artist_id = db.Column(db.Integer, db.ForeignKey("artist.id"), nullable=False)

    def __repr__(self):
        return f'<Music {self.title}>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "media_url": self.media_url,
            "duration": self.duration,
        }

    # USER SAVED MUSIC / ARTISTS

class Saved_Artist(db.Model):
    __tablename__ = "saved_artist"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    artist_id = db.Column(db.Integer, db.ForeignKey("artist.id"))

    def __repr__(self):
        return f'<Saved_Artist {self.artist_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "artist_id": self.artist_id
        }

class Saved_Music(db.Model):
    __tablename__ = "saved_music"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    artist_id = db.Column(db.Integer, db.ForeignKey("artist.id"))
    
    music_id = db.Column(db.Integer, db.ForeignKey("music.id"))


    def __repr__(self):
        return f'<Saved_Music {self.music_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "artist_id": self.artist_id,
            "music_id": self.music_id
        }