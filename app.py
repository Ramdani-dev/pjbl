from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='.', static_url_path='/')

@app.route('/')
def home():
    """Serve the main landing and menu screen."""
    return send_from_directory('.', 'index.html')

@app.route('/kamera')
def kamera():
    """Serve the Camera Hand-Detection Mode."""
    return send_from_directory('mode_cam', 'index.html')

@app.route('/suit')
def suit():
    """Serve the Normal Mode."""
    return send_from_directory('mode_biasa', 'index.html')

if __name__ == '__main__':
    print("Membuka server Flask di http://localhost:3000")
    app.run(debug=True, port=3000)
