class WebcamHandler {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.isRunning = false;
    }
       async start() {
        if (this.isRunning) {
            return true;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },    
                    height: { ideal: 480 },   
                    facingMode: 'user'
                },
                audio: false 
            });

            this.video.srcObject = this.stream;
            
            await this.video.play();
            
            this.isRunning = true;
            
            return true;
        } catch (error) {
            
            if (error.name === 'NotAllowedError') {
                throw new Error('Izin kamera ditolak. Silakan izinkan akses kamera.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('Kamera tidak ditemukan. Pastikan webcam terhubung.');
            } else {
                throw new Error('Gagal mengakses webcam: ' + error.message);
            }
        }
    }
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }

        this.video.srcObject = null;
        
        this.isRunning = false;
    }
    captureFrame(canvas) {
        if (!this.isRunning) {
            return null;
        }

        const ctx = canvas.getContext('2d');
        
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;

        ctx.translate(canvas.width, 0);  
        ctx.scale(-1, 1);                 
        
        ctx.drawImage(this.video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        return canvas;
    }
    getDimensions() {
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
    }
}
window.WebcamHandler = WebcamHandler;