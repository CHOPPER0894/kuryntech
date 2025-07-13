from flask import Flask, jsonify
from db import get_db_connection
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return "✅ Kuryntech Flask App is running!"

@app.route('/data')
def get_data():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM sample_table")
        rows = cursor.fetchall()
        conn.close()
        return jsonify(rows)
    except Exception as e:
        error_response = {
            "error": str(e),
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        print("🔥 ERROR:", error_response)
        return jsonify(error_response), 500

if __name__ == '__main__':
    app.run()
