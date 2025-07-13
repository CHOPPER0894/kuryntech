from flask import Flask, jsonify
from db import get_db_connection

app = Flask(__name__)

@app.route('/')
def home():
    return "✅ Kuryntech Flask App Connected to Local MySQL!"

@app.route('/data')
def get_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sample_table")  # replace with real table
    rows = cursor.fetchall()
    conn.close()
    return jsonify(rows)

if __name__ == '__main__':
    app.run(debug=True)
