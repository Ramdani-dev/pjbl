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
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch = ${epoch + 1}, loss = ${logs.loss}, accuracy = ${logs.acc}`)
            }
        }
    })
    return MODEL;
};

function predict(MODEL, recentMoves) {
    const input = tf.tensor3d([recentMoves.map(m => [m])]);
    const prediction = MODEL.predict(input);

    const output = prediction.argMax(-1).dataSync()[0];
    const pilihan = ['batu', 'kertas', 'gunting'];
    const pilihanLawan = pilihan[output];
    const pilihanAI = pilihan[(output + 1) % 3];
    return "pilihan ai adalah : " + pilihanAI + " dan prediksi pilihan lawan adalah : " + pilihanLawan;


};
const finalModel = await train();
const hasil = predict(finalModel, [0, 1, 0, 2, 1]);
console.log(hasil);