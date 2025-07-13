from flask import Blueprint, jsonify
from db import get_cursor, get_db
from datetime import datetime
from collections import defaultdict

bp = Blueprint('energy', __name__, url_prefix='/api/data')

# Called from app.py after receiving data
def insert_energy_log(data):
    cursor = get_cursor()
    cursor.execute(
        """
        INSERT INTO energy_logs (username, voltage, current, energy_kwh, cost, region, rate, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data['user'],
            data['voltage'],
            data['current'],
            data['energy'],
            data['cost'],
            data['region'],
            data['rate'],
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
    )
    get_db().commit()

@bp.route('/latest', methods=['GET'])
def get_latest():
    cursor = get_cursor()
    cursor.execute("SELECT * FROM energy_logs ORDER BY timestamp DESC LIMIT 1")
    row = cursor.fetchone()
    return jsonify(row if row else {})

@bp.route('/summary', methods=['GET'])
def get_summary():
    cursor = get_cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    week = datetime.now().isocalendar().week
    month = datetime.now().strftime('%Y-%m')

    summary = {
        'today': 0.0,
        'week': 0.0,
        'month': 0.0
    }

    cursor.execute("SELECT timestamp, energy_kwh FROM energy_logs")
    rows = cursor.fetchall()

    for row in rows:
        try:
            ts = row['timestamp']
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            elif isinstance(ts, datetime) == False:
                ts = datetime.strptime(str(ts), '%Y-%m-%d %H:%M:%S')

            if ts.strftime('%Y-%m-%d') == today:
                summary['today'] += float(row['energy_kwh'])
            if ts.isocalendar().week == week:
                summary['week'] += float(row['energy_kwh'])
            if ts.strftime('%Y-%m') == month:
                summary['month'] += float(row['energy_kwh'])
        except Exception as e:
            continue

    return jsonify(summary)

@bp.route('/monthly', methods=['GET'])
def get_monthly_cost():
    cursor = get_cursor()
    cursor.execute("SELECT timestamp, cost FROM energy_logs")
    rows = cursor.fetchall()

    monthly_totals = defaultdict(float)
    for row in rows:
        try:
            ts = row['timestamp']
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            elif isinstance(ts, datetime) == False:
                ts = datetime.strptime(str(ts), '%Y-%m-%d %H:%M:%S')

            key = ts.strftime('%Y-%m')
            monthly_totals[key] += float(row['cost'])
        except:
            continue

    return jsonify(monthly_totals)
