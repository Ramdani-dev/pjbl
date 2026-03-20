import * as tf from "@tensorflow/tfjs";

function createModel(windowSize) {
    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 32,
        inputShape: [windowSize, 1]
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
        optimizer: 'adam',
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['acc']
    });
    return model;
}

const windowSize = 5;
const trainX = tf.tensor3d([
    [[0], [1], [0], [2], [1]],
    [[1], [0], [2], [1], [0]]
], [2, 5, 1], 'float32');

const trainY = tf.tensor1d([2, 1], 'float32');

async function train() {
    const MODEL = createModel(windowSize);
    await MODEL.fit(trainX, trainY, {
        epochs: 500,
        callbacks: {
            onEpochEnd: (epoch, logs) => {}
        }
    })
    return MODEL;
};

function predict(MODEL, recentMoves) {
    const input = tf.tensor3d([recentMoves.map(m => [m])]);
    const prediction = MODEL.predict(input);

    const output = prediction.argMax(-1).dataSync()[0];
    const choices = ['rock', 'paper', 'scissors'];
    const opponentChoice = choices[output];
    const aiChoice = choices[(output + 1) % 3];
    return "AI choice: " + aiChoice + " | Predicted opponent choice: " + opponentChoice;
};

const finalModel = await train();
const result = predict(finalModel, [0, 1, 0, 2, 1]);