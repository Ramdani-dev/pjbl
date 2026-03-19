class WebcamManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.aliran = null;
        this.isActive = false;
    }

    async start() {
        if (this.isActive) {
            return true;
        }

        try {
            this.aliran = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            this.video.srcObject = this.aliran;
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
        if (this.aliran) {
            this.aliran.getTracks().forEach(jalur => {
                jalur.stop();
            });
            this.aliran = null;
        }

        this.video.srcObject = null;
        this.isActive = false;
    }

    tangkapLayar(kanvas) {
        if (!this.isActive) {
            return null;
        }

        const KONTEKS = kanvas.getContext('2d');
        kanvas.width = this.video.videoWidth;
        kanvas.height = this.video.videoHeight;

        KONTEKS.translate(kanvas.width, 0);
        KONTEKS.scale(-1, 1);
        KONTEKS.drawImage(this.video, 0, 0);
        KONTEKS.setTransform(1, 0, 0, 1, 0, 0);

        return kanvas;
    }

    ambilUkuran() {
        return {
            lebar: this.video.videoWidth,
            tinggi: this.video.videoHeight
        };
    }
}

window.WebcamManager = WebcamManager;