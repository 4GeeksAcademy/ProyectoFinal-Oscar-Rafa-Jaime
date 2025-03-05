"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import os

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

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/img', methods=["POST"])
def upload_image():
    img = request.files["img"]
    img_url = cloudinary.uploader.upload(img)
    print(img_url)
    return jsonify({"img": img_url["url"]}),200

 # GET: Obtener fotos
@api.route('/artist/<int:artist_id>/photos', methods=['GET'])
def get_artist_photos(artist_id):
    # Verifica si el artista existe (descomenta o ajusta según tu modelo real)
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({"msg": "Artista no encontrado"}), 404

    # Obtén las fotos para este artista
    photos = Photo.query.filter_by(artist_id=artist_id).all()
    serialized_photos = [p.serialize() for p in photos]
    return jsonify(serialized_photos), 200

 # POST: Guardar nueva foto
@api.route('/artist/<int:artist_id>/photos', methods=['POST'])
def create_artist_photo(artist_id):
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({"msg": "Artista no encontrado"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"msg": "No data provided"}), 400

    media_url = body.get("media_url")
    title = body.get("title", "Sin título")

    if not media_url:
        return jsonify({"msg": "media_url is required"}), 400

    # Creamos la foto
    new_photo = Photo(
        title=title,
        media_url=media_url,
        artist_id=artist_id
    )
    db.session.add(new_photo)
    db.session.commit()

    return jsonify(new_photo.serialize()), 201

 # DELETE: Eliminar foto 
@api.route('/artist/<int:artist_id>/photos/<int:photo_id>', methods=['DELETE'])
def delete_artist_photo(artist_id, photo_id):
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({"msg": "Artista no encontrado"}), 404

    photo = Photo.query.filter_by(id=photo_id, artist_id=artist_id).first()
    if not photo:
        return jsonify({"msg": "Foto no encontrada"}), 404

    db.session.delete(photo)
    db.session.commit()
    return jsonify({"msg": "Foto eliminada con éxito"}), 200
