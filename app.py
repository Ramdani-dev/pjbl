from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='.', static_url_path='/')

@app.route('/')
def home():
    """Serve the main landing and menu screen."""
    return send_from_directory('.', 'index.html')

@app.route('/kamera')
def camera_mode():
    """Serve the Camera Hand-Detection Mode."""
    return send_from_directory('mode_cam', 'index.html')

@app.route('/suit')
def normal_mode():
    """Serve the Normal Mode."""
    return send_from_directory('mode_biasa', 'index.html')

@app.route('/kamera-ai')
def camera_ai_mode():
    """Serve the Camera Mode with AI (LSTM prediction)."""
    return send_from_directory('mode_ai/ai_cam', 'index.html')

@app.route('/suit-ai')
def normal_ai_mode():
    """Serve the Normal Mode with AI (LSTM prediction)."""
    return send_from_directory('mode_ai/ai_biasa', 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=3000)
