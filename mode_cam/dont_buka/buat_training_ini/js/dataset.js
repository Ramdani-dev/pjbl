let dataset = { samples: [], labels: [] };

        function getTrainingData() {
            const labelToIdx = {};
            dataset.labels.forEach((l, i) => labelToIdx[l] = i);
            return {
                X: dataset.samples.map(s => s.landmarks),
                y: dataset.samples.map(s => labelToIdx[s.label]),
                labels: dataset.labels,
                numClasses: dataset.labels.length
            };
        }
document.getElementById('importFile').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    dataset.samples = data.samples;
                    dataset.labels = data.labels || [...new Set(data.samples.map(s => s.label))].sort();

                    const info = document.getElementById('datasetInfo');
                    info.innerHTML = `
                        <strong>✅ Dataset loaded!</strong><br>
                        Samples: ${dataset.samples.length}<br>
                        Labels: ${dataset.labels.join(', ')}
                    `;

                    status.textContent = 'Dataset siap! Klik Start Training';
                    document.getElementById('btnTrain').disabled = false;
                    addLog(`Loaded ${dataset.samples.length} samples with ${dataset.labels.length} classes`);
                } catch (err) {
                    status.textContent = 'Error: ' + err.message;
                }
            };
            reader.readAsText(file);
        };