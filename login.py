from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Fake DB for now
USER_DB = "data/users.json"
if not os.path.exists(USER_DB):
    with open(USER_DB, "w") as f:
        json.dump([], f)

def load_users():
    with open(USER_DB, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USER_DB, "w") as f:
        json.dump(users, f, indent=2)

@app.route('/')
def home():
    return render_template("login.html")

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    side = data.get('side')  # 'admin' or 'client'

    users = load_users()
    if any(u['username'] == username for u in users):
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

    users.append({'username': username, 'email': email, 'password': password, 'side': side})
    save_users(users)
    return jsonify({'success': True})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    users = load_users()
    for user in users:
        if user['username'] == username and user['password'] == password:
            return jsonify({'success': True, 'side': user['side']})

    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/wifi', methods=['POST'])
def save_wifi():
    data = request.get_json()
    ssid = data.get('ssid')
    password = data.get('password')
    # You can save this to a file or send it to ESP32
    print(f"Wi-Fi Saved: {ssid}, {password}")
    return jsonify({'success': True})

@app.route('/rate', methods=['POST'])
def save_rate():
    data = request.get_json()
    region = data.get('region')
    rate = data.get('rate')
    print(f"Region: {region} | Rate: {rate}")
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
