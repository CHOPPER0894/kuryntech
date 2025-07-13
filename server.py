@socketio.on('connect')
def on_connect():
    print('Client connected')

def log_and_emit(data):
    ...
    socketio.emit('energy_data', data)
