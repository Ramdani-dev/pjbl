class HandTracker {
    constructor() {
        this.tangan = null;
        this.isModelReady = false;
        this.hasilTerakhir = null;
    }

    async initialize() {
        return new Promise((berhasil, gagal) => {
            try {
                this.tangan = new Hands({
                    locateFile: (berkas) => 
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${berkas}`
                });

                this.tangan.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.5
                });

                this.tangan.onResults((hasilDeteksi) => {
                    this.hasilTerakhir = hasilDeteksi;
                });

                const KANVAS_UJI = document.createElement('canvas');
                KANVAS_UJI.width = 10;
                KANVAS_UJI.height = 10;

                this.tangan.send({ image: KANVAS_UJI }).then(() => {
                    this.isModelReady = true;
                    berhasil();
                });
            } catch (errorMsg) {
                gagal(errorMsg);
            }
        });
    }

    async lacak(videoElement) {
        if (!this.isModelReady) throw new Error('Sistem belum siap');
        await this.tangan.send({ image: videoElement });
        return this.hasilTerakhir;
    }

    ambilTitik(hasilTracking) {
        if (!hasilTracking?.multiHandLandmarks?.length) return null;
        
        const TITIK_TANGAN = hasilTracking.multiHandLandmarks[0];
        const DATA_DATAR = [];
        for (const dot of TITIK_TANGAN) {
            DATA_DATAR.push(dot.x, dot.y);
        }
        return DATA_DATAR;
    }

    gambarTitik(kanvas, hasilTracking, warnaGaris = '#00F0FF') {
        const KUAS = kanvas.getContext('2d');
        if (!hasilTracking?.multiHandLandmarks?.length) return;

        const TITIK_TANGAN = hasilTracking.multiHandLandmarks[0];
        const LEBAR_KANVAS = kanvas.width;
        const TINGGI_KANVAS = kanvas.height;

        const HUBUNGAN_JARI = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [0,9],[9,10],[10,11],[11,12],
            [0,13],[13,14],[14,15],[15,16],
            [0,17],[17,18],[18,19],[19,20],
            [5,9],[9,13],[13,17]
        ];

        KUAS.strokeStyle = warnaGaris;
        KUAS.lineWidth = 3;
        for (const [awal, akhir] of HUBUNGAN_JARI) {
            const X1 = (1 - TITIK_TANGAN[awal].x) * LEBAR_KANVAS;
            const Y1 = TITIK_TANGAN[awal].y * TINGGI_KANVAS;
            const X2 = (1 - TITIK_TANGAN[akhir].x) * LEBAR_KANVAS;
            const Y2 = TITIK_TANGAN[akhir].y * TINGGI_KANVAS;
            KUAS.beginPath();
            KUAS.moveTo(X1, Y1);
            KUAS.lineTo(X2, Y2);
            KUAS.stroke();
        }

        KUAS.fillStyle = '#fff';
        for (const p of TITIK_TANGAN) {
            KUAS.beginPath();
            KUAS.arc((1 - p.x) * LEBAR_KANVAS, p.y * TINGGI_KANVAS, 5, 0, 2 * Math.PI);
            KUAS.fill();
        }
    }
}

window.HandTracker = HandTracker;