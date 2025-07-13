from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class SensorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voltage = db.Column(db.Float, nullable=False)
    current = db.Column(db.Float, nullable=False)
    power = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class WiFiCredential(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ssid = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    device_id = db.Column(db.String(50))  # Optional if many ESP32s
