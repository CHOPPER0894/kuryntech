from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import json, os, csv, datetime, subprocess, requests
from collections import defaultdict
from routes.energy_routes import bp as energy_bp
from db import get_db  # ✅ MySQL RDS connection

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ====== USER SIGNUP ======
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    side = data.get('side')

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Username already exists'}), 409

        cursor.execute(
            "INSERT INTO users (username, email, password, side) VALUES (%s, %s, %s, %s)",
            (username, email, password, side)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True}), 201
    except Exception as e:
        print("❌ Signup Error:", e)
        return jsonify({'success': False, 'message': 'DB error'}), 500

# ====== USER LOGIN ======
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT side FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({'success': True, 'side': user['side']}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    except Exception as e:
        print("❌ Login Error:", e)
        return jsonify({'success': False, 'message': 'DB error'}), 500

# ====== WIFI CONFIGURATION ======
@app.route('/wifi', methods=['POST'])
def save_wifi():
    data = request.get_json()
    ssid = data.get('ssid')
    password = data.get('password')

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO wifi_settings (ssid, password) VALUES (%s, %s)",
            (ssid, password)
        )
        db.commit()
        cursor.close()
        db.close()
        return jsonify({'success': True}), 201
    except Exception as e:
        print("❌ WiFi DB Error:", e)
        return jsonify({'success': False, 'message': 'DB error'}), 500

@app.route('/wifi/scan', methods=['GET'])
def scan_wifi():
    try:
        output = subprocess.check_output("netsh wlan show networks", shell=True, encoding='utf-8')
        lines = output.split('\n')
        networks = []
        for line in lines:
            if "SSID" in line:
                ssid = line.split(":", 1)[-1].strip()
                if ssid and ssid not in networks:
                    networks.append(ssid)
        return jsonify({'networks': networks})
    except Exception as e:
        print("❌ WiFi scan error:", e)
        return jsonify({'networks': []})

# ====== RATE CONFIGURATION ======
@app.route('/rate', methods=['POST'])
def save_rate():
    data = request.get_json()
    region = data.get('region')
    rate = data.get('rate')
    print(f"🌍 Region: {region} | Rate: {rate}")
    return jsonify({'success': True})

# ====== ENERGY LOGGING ======
CSV_LOG = os.path.join("backend", "data", "energy_logs.csv")

def calculate_cost(energy_kwh, rate):
    return round(energy_kwh * rate, 2)

def log_and_emit(data):
    first = not os.path.isfile(CSV_LOG)
    with open(CSV_LOG, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data.keys())
        if first:
            writer.writeheader()
        writer.writerow(data)
    socketio.emit('energy_data', data)

@app.route('/api/data/upload', methods=['POST'])
def upload_data():
    payload = request.get_json()
    required = ['user', 'voltage', 'current', 'energy', 'region', 'rate']
    for key in required:
        if key not in payload:
            return jsonify({'error': f'Missing {key}'}), 400

    payload['cost'] = calculate_cost(payload['energy'], payload['rate'])
    payload['timestamp'] = datetime.datetime.now().isoformat()

    log_and_emit(payload)

    from routes.energy_routes import insert_energy_log
    insert_energy_log(payload)

    return jsonify({'status': 'ok'}), 200

# ====== TEST CONNECTION TO RDS ======
@app.route('/test-db')
def test_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return jsonify({"db_version": version})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====== ESP32 RESET ENDPOINT ======
@app.route('/reset', methods=['POST'])
def reset_prototype():
    try:
        esp32_ip = "http://192.168.1.122"
        response = requests.post(f"{esp32_ip}/reset", timeout=3)

        if response.status_code == 200:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'ESP32 reset failed'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ====== WEBSOCKET EVENT ======
@socketio.on('connect')
def on_connect():
    print('✅ Client connected via WebSocket')

# ====== REGISTER BLUEPRINT ======
app.register_blueprint(energy_bp)

# ====== START APP ======
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
