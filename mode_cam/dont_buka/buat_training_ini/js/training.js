document.getElementById('btnTrain').onclick = async () => {
            const data = getTrainingData();
            if (data.numClasses < 2) { status.textContent = 'Butuh minimal 2 kelas!'; return; }

            const epochs = parseInt(document.getElementById('epochs').value) || 50;
            const batchSize = parseInt(document.getElementById('batchSize').value) || 16;

            document.getElementById('btnTrain').disabled = true;
            log.textContent = '';
            addLog('Building model...');

            model.build(data.numClasses);
            addLog(`Model built: ${data.numClasses} classes`);
            addLog(`Training with ${data.X.length} samples\n`);

            try {
                await model.train(data.X, data.y, data.labels, {
                    epochs, batchSize,
                    onEpochEnd: async (epoch, logs) => {
                        const pct = ((epoch + 1) / epochs) * 100;
                        progress.style.width = pct + '%';
                        progress.textContent = Math.round(pct) + '%';
                        addLog(`Epoch ${epoch + 1}/${epochs} - loss: ${logs.loss.toFixed(4)}, acc: ${(logs.acc * 100).toFixed(1)}%`);
                        status.textContent = `Training... Epoch ${epoch + 1}/${epochs}`;
                    }
                });

                addLog('\n✅ Training complete!');
                status.textContent = 'Training selesai! Model siap disimpan.';


                if (confirm('Training selesai! Simpan model?')) {
                    await model.save("");
                    addLog('Model saved!');
                }
            } catch (err) {
                addLog('❌ Error: ' + err.message);
                status.textContent = 'Training error!';
            }

            document.getElementById('btnTrain').disabled = false;
        };