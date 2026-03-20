
class HandDetector {
    constructor() {
        this.hands = null;
        this.isReady = false;
        this.lastResults = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                this.hands = new Hands({
                    locateFile: (file) => 
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });

                this.hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.5
                });

                this.hands.onResults((results) => {
                    this.lastResults = results;
                });

                const testCanvas = document.createElement('canvas');
                testCanvas.width = 10;
                testCanvas.height = 10;

                this.hands.send({ image: testCanvas }).then(() => {
                    this.isReady = true;
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async detect(videoElement) {
        if (!this.isReady) throw new Error('Not initialized');
        await this.hands.send({ image: videoElement });
        return this.lastResults;
    }

    extractLandmarks(results) {
        if (!results?.multiHandLandmarks?.length) return null;
        
        const landmarks = results.multiHandLandmarks[0];
        const flat = [];
        for (const point of landmarks) {
            flat.push(point.x, point.y);
        }
        return flat;
    }

    drawLandmarks(canvas, results, color = '#00ff88') {
        const ctx = canvas.getContext('2d');
        if (!results?.multiHandLandmarks?.length) return;

        const landmarks = results.multiHandLandmarks[0];
        const { width, height } = canvas;

        const connections = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [0,9],[9,10],[10,11],[11,12],
            [0,13],[13,14],[14,15],[15,16],
            [0,17],[17,18],[18,19],[19,20],
            [5,9],[9,13],[13,17]
        ];

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        for (const [s, e] of connections) {
            const x1 = (1 - landmarks[s].x) * width;
            const y1 = landmarks[s].y * height;
            const x2 = (1 - landmarks[e].x) * width;
            const y2 = landmarks[e].y * height;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        for (const p of landmarks) {
            ctx.beginPath();
            ctx.arc((1 - p.x) * width, p.y * height, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

window.HandDetector = HandDetector;