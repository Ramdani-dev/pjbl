class HandTracker {
    constructor() {
        this.hands = null;
        this.isModelReady = false;
        this.lastResult = null;
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

                this.hands.onResults((detectionResult) => {
                    this.lastResult = detectionResult;
                });

                const TEST_CANVAS = document.createElement('canvas');
                TEST_CANVAS.width = 10;
                TEST_CANVAS.height = 10;

                this.hands.send({ image: TEST_CANVAS }).then(() => {
                    this.isModelReady = true;
                    resolve();
                });
            } catch (errorMsg) {
                reject(errorMsg);
            }
        });
    }

    async track(videoElement) {
        if (!this.isModelReady) throw new Error('Sistem belum siap');
        await this.hands.send({ image: videoElement });
        return this.lastResult;
    }

    extractLandmarks(trackingResult) {
        if (!trackingResult?.multiHandLandmarks?.length) return null;
        
        const HAND_POINTS = trackingResult.multiHandLandmarks[0];
        const FLAT_DATA = [];
        for (const dot of HAND_POINTS) {
            FLAT_DATA.push(dot.x, dot.y);
        }
        return FLAT_DATA;
    }

    drawLandmarks(canvas, trackingResult, lineColor = '#00F0FF') {
        const ctx = canvas.getContext('2d');
        if (!trackingResult?.multiHandLandmarks?.length) return;

        const HAND_POINTS = trackingResult.multiHandLandmarks[0];
        const CANVAS_WIDTH = canvas.width;
        const CANVAS_HEIGHT = canvas.height;

        const FINGER_CONNECTIONS = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [0,9],[9,10],[10,11],[11,12],
            [0,13],[13,14],[14,15],[15,16],
            [0,17],[17,18],[18,19],[19,20],
            [5,9],[9,13],[13,17]
        ];

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        for (const [start, end] of FINGER_CONNECTIONS) {
            const X1 = (1 - HAND_POINTS[start].x) * CANVAS_WIDTH;
            const Y1 = HAND_POINTS[start].y * CANVAS_HEIGHT;
            const X2 = (1 - HAND_POINTS[end].x) * CANVAS_WIDTH;
            const Y2 = HAND_POINTS[end].y * CANVAS_HEIGHT;
            ctx.beginPath();
            ctx.moveTo(X1, Y1);
            ctx.lineTo(X2, Y2);
            ctx.stroke();
        }

        ctx.fillStyle = '#fff';
        for (const p of HAND_POINTS) {
            ctx.beginPath();
            ctx.arc((1 - p.x) * CANVAS_WIDTH, p.y * CANVAS_HEIGHT, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

window.HandTracker = HandTracker;