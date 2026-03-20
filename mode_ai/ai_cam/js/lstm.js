class LSTMPredictor {
    constructor() {
        this.model = null;
        this.windowSize = 5;
        this.isReady = false;
        this.playerData = [];
        this.roundCount = 0;
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.lstm({
            units: 32,
            inputShape: [this.windowSize, 1]
        }));
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }));
        model.add(tf.layers.dense({
            units: 3,
            activation: 'softmax'
        }));
        model.compile({
            optimizer: tf.train.adam(0.02),
            loss: 'sparseCategoricalCrossentropy',
            metrics: ['acc']
        });
        return model;
    }

    async train(onProgress) {
        this.model = this.createModel();

        const patterns = [
            [[0], [0], [0], [0], [0]],
            [[1], [1], [1], [1], [1]],
            [[2], [2], [2], [2], [2]],
            [[0], [0], [0], [0], [1]],
            [[1], [1], [1], [1], [0]],
            [[2], [2], [2], [2], [0]],
            [[0], [0], [0], [1], [0]],
            [[1], [1], [1], [0], [1]],
            [[2], [2], [2], [1], [2]],
            [[0], [1], [0], [1], [0]],
            [[1], [0], [1], [0], [1]],
            [[0], [2], [0], [2], [0]],
            [[2], [0], [2], [0], [2]],
            [[1], [2], [1], [2], [1]],
            [[2], [1], [2], [1], [2]],
            [[0], [1], [2], [0], [1]],
            [[1], [2], [0], [1], [2]],
            [[2], [0], [1], [2], [0]],
            [[2], [1], [0], [2], [1]],
            [[1], [0], [2], [1], [0]],
            [[0], [2], [1], [0], [2]],
            [[0], [0], [1], [1], [1]],
            [[1], [1], [2], [2], [2]],
            [[2], [2], [0], [0], [0]],
            [[0], [1], [0], [2], [0]],
            [[1], [2], [1], [0], [1]],
            [[2], [0], [2], [1], [2]],
            [[0], [2], [0], [0], [1]],
            [[1], [0], [1], [1], [2]],
            [[2], [1], [2], [2], [0]],
            [[0], [1], [2], [0], [0]],
            [[1], [2], [0], [1], [1]],
            [[2], [0], [1], [2], [2]],
        ];

        const labels = [
            0, 1, 2, 0, 1, 2, 0, 1, 2,
            1, 0, 2, 0, 2, 1,
            2, 0, 1, 0, 2, 1,
            1, 2, 0,
            0, 1, 2, 0, 1, 2,
            0, 1, 2
        ];

        const trainX = tf.tensor3d(patterns, [patterns.length, this.windowSize, 1], 'float32');
        const trainY = tf.tensor1d(labels, 'float32');

        await this.model.fit(trainX, trainY, {
            epochs: 100,
            batchSize: 16,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (onProgress && epoch % 10 === 0) {
                        onProgress(epoch + 1, 100, logs.loss, logs.acc);
                    }
                }
            }
        });

        trainX.dispose();
        trainY.dispose();
        this.isReady = true;
    }

    addPlayerData(history, nextChoice) {
        if (history.length === this.windowSize) {
            this.playerData.push({
                input: history.slice(),
                label: nextChoice
            });
        }
        this.roundCount++;

        if (this.roundCount % 5 === 0 && this.playerData.length >= 3) {
            this.retrain();
        }
    }

    async retrain() {
        if (!this.model || this.playerData.length < 3) return;

        const recentData = this.playerData.slice(-20);
        const inputs = recentData.map(d => d.input.map(v => [v]));
        const labelArr = recentData.map(d => d.label);

        const trainX = tf.tensor3d(inputs, [inputs.length, this.windowSize, 1], 'float32');
        const trainY = tf.tensor1d(labelArr, 'float32');

        try {
            await this.model.fit(trainX, trainY, {
                epochs: 50,
                batchSize: 4,
                shuffle: true
            });
        } catch (err) {}

        trainX.dispose();
        trainY.dispose();
    }

    predict(recentMoves) {
        if (!this.isReady || !this.model || recentMoves.length !== this.windowSize) return null;

        const input = tf.tensor3d([recentMoves.map(m => [m])]);
        const prediction = this.model.predict(input);
        const predictedMove = prediction.argMax(-1).dataSync()[0];

        input.dispose();
        prediction.dispose();

        const counterMap = { 0: 'paper', 1: 'scissors', 2: 'rock' };
        return counterMap[predictedMove];
    }
}

window.LSTMPredictor = LSTMPredictor;