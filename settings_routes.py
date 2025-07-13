# routes/settings_routes.py
from flask import Blueprint, request, jsonify
from db import get_db

bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@bp.route('/<username>', methods=['GET'])
def get_user_settings(username):
    db = get_db()

    # Get user basic info
    user = db.execute("SELECT name, email FROM users WHERE username = ?", (username,)).fetchone()
    if not user:
        return jsonify({}), 404

    # Get preferences
    prefs = db.execute("SELECT * FROM user_settings WHERE username = ?", (username,)).fetchone()

    settings = {
        "name": user["name"],
        "email": user["email"],
        "timezone": prefs["timezone"] if prefs else "Asia/Manila (GMT+8)",
        "unit": prefs["unit"] if prefs else "kWh (Kilowatt-hour)",
        "language": prefs["language"] if prefs else "English",
        "notifications_enabled": bool(prefs["notifications_enabled"]) if prefs else True
    }
    return jsonify(settings)

@bp.route('/save', methods=['POST'])
def save_user_settings():
    data = request.get_json()
    username = data['username']
    db = get_db()

    # Update user basic info
    db.execute("UPDATE users SET name = ?, email = ? WHERE username = ?", 
               (data['name'], data['email'], username))
    
    # Optionally update password
    if data.get('password'):
        db.execute("UPDATE users SET password = ? WHERE username = ?", (data['password'], username))

    # Check if settings exist
    exists = db.execute("SELECT id FROM user_settings WHERE username = ?", (username,)).fetchone()
    if exists:
        db.execute("""
            UPDATE user_settings
            SET timezone = ?, unit = ?, language = ?, notifications_enabled = ?
            WHERE username = ?
        """, (data['timezone'], data['unit'], data['language'], data['notifications'], username))
    else:
        db.execute("""
            INSERT INTO user_settings (username, timezone, unit, language, notifications_enabled)
            VALUES (?, ?, ?, ?, ?)
        """, (username, data['timezone'], data['unit'], data['language'], data['notifications']))
    
    db.commit()
    return jsonify({'success': True})
