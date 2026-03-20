class WebcamManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.isActive = false;
    }

    async start() {
        if (this.isActive) {
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
            this.isActive = true;
            return true;
        } catch (errorMsg) {
            if (errorMsg.name === 'NotAllowedError') {
                throw new Error('Izin kamera ditolak. Silakan izinkan akses kamera.');
            } else if (errorMsg.name === 'NotFoundError') {
                throw new Error('Kamera tidak ditemukan. Pastikan webcam terhubung.');
            } else {
                throw new Error('Gagal mengakses webcam: ' + errorMsg.message);
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
        this.isActive = false;
    }

    captureFrame(canvas) {
        if (!this.isActive) {
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

    getSize() {
        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
    }
}

window.WebcamManager = WebcamManager;