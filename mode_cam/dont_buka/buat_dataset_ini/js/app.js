document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const btnStart = document.getElementById('button-on');
    const btnStop = document.getElementById('button-off');
    const statusEl = document.getElementById('status');

    const webcam = new WebcamHandler(video);
    const detector = new HandDetector();
    const dataset = new DatasetManager();
    let isDetecting = false;

    statusEl.textContent = 'Memuat model MediaPipe Hands...';
    try {
        await detector.initialize();
        statusEl.textContent = 'Siap! Klik Start Webcam untuk mulai.';
    } catch (err) {
        statusEl.textContent = '❌ Gagal memuat model: ' + err.message;
        return;
    }

    function updateUI() {
        document.getElementById('sampleCount').textContent = dataset.getTotalCount();
        const counts = dataset.getSampleCounts();
        const labels = dataset.getLabels();
        document.getElementById('labelList').innerHTML = labels.length
            ? labels.map(l => `<span style="background:#00ff88;color:#000;padding:2px 8px;border-radius:8px;margin:2px;display:inline-block;font-size:14px;">${l}: ${counts[l]}</span>`).join('')
            : '<em>Belum ada data</em>';
    }

    async function detectionLoop() {
        if (!isDetecting) return;

        webcam.captureFrame(canvas);

        try {
            const results = await detector.detect(video);
            detector.drawLandmarks(canvas, results);

            if (results?.multiHandLandmarks?.length) {
                statusEl.textContent = '✋ Tangan terdeteksi!';
            } else {
                statusEl.textContent = '👋 Tunjukkan tangan ke kamera...';
            }
        } catch (err) {
        }

        requestAnimationFrame(detectionLoop);
    }

    btnStart.addEventListener('click', async () => {
        try {
            statusEl.textContent = 'Memulai Webcam...';
            await webcam.start();

            btnStart.disabled = true;
            btnStop.disabled = false;
            statusEl.textContent = 'Webcam Aktif! Mendeteksi tangan...';

            isDetecting = true;
            detectionLoop();
        } catch (error) {
            statusEl.textContent = '❌ ' + error.message;
        }
    });

    btnStop.addEventListener('click', () => {
        isDetecting = false;
        webcam.stop();
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        btnStart.disabled = false;
        btnStop.disabled = true;
        statusEl.textContent = 'Webcam dihentikan';
    });

    function capture() {
        const label = document.getElementById('labelInput').value.trim();
        if (!label) {
            statusEl.textContent = '❌ Masukkan label dulu!';
            return;
        }
        const lm = detector.extractLandmarks(detector.lastResults);
        if (!lm) {
            statusEl.textContent = '❌ Tangan tidak terdeteksi!';
            return;
        }
        dataset.addSample(label, lm);
        updateUI();
        statusEl.textContent = `✅ Captured "${label}"!`;
        canvas.style.boxShadow = '0 0 20px #00ff88';
        setTimeout(() => canvas.style.boxShadow = 'none', 200);
    }

    document.getElementById('btnCapture').addEventListener('click', capture);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && webcam.isRunning) {
            e.preventDefault();
            capture();
        }
    });

    document.getElementById('btnExport').addEventListener('click', () => {
        if (dataset.getTotalCount() > 0) {
            dataset.downloadAsFile();
        } else {
            statusEl.textContent = 'Dataset kosong!';
        }
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        if (confirm('Hapus semua data?')) {
            dataset.clear();
            updateUI();
            statusEl.textContent = 'Data dihapus';
        }
    });

    // Init UI
    btnStop.disabled = true;
    updateUI();
});
