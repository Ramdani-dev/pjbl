class GestureModel {
            constructor() { this.model = null; this.labels = []; this.isBuilt = false; }

            build(numClasses) {
                if (this.model) this.model.dispose();
                this.model = tf.sequential();
                this.model.add(tf.layers.dense({ inputShape: [42], units: 128, activation: 'relu' }));
                this.model.add(tf.layers.dropout({ rate: 0.3 }));
                this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
                this.model.add(tf.layers.dropout({ rate: 0.3 }));
                this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
                this.model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));
                this.model.compile({ optimizer: tf.train.adam(0.001), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
                this.isBuilt = true;
            }

            async train(X, y, labels, options = {}) {
                const { epochs = 50, batchSize = 16, onEpochEnd = null } = options;
                this.labels = labels;
                const xTensor = tf.tensor2d(X);
                const yOneHot = tf.oneHot(tf.tensor1d(y, 'int32'), labels.length);

                try {
                    await this.model.fit(xTensor, yOneHot, {
                        epochs, batchSize, validationSplit: 0.2, shuffle: true,
                        callbacks: { onEpochEnd: async (epoch, logs) => { if (onEpochEnd) await onEpochEnd(epoch, logs); } }
                    });
                } finally {
                    xTensor.dispose();
                    yOneHot.dispose();
                }
            }

            async save(name = 'model') {
                await this.model.save(`downloads://${name}`);
                const blob = new Blob([JSON.stringify({ labels: this.labels })], { type: 'application/json' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                a.download = `metadata.json`; a.click();
            }
        }

        const model = new GestureModel();
        const status = document.getElementById('status');
        const log = document.getElementById('trainingLog');
        const progress = document.getElementById('progress');

        function addLog(msg) {
            log.textContent += msg + '\n';
            log.scrollTop = log.scrollHeight;
        }