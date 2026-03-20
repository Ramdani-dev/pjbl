class GestureModel {
    constructor() {
        this.engine = null;
        this.labelList = [];
        this.isModelReady = false;
    }

    async loadData(folderPath) {
        this.engine = await tf.loadLayersModel(folderPath + '/model.json');

        const RESPONSE = await fetch(folderPath + '/metadata.json');
        const META_DATA = await RESPONSE.json();

        this.labelList = META_DATA.labels;

        this.engine.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this.isModelReady = true;
    }

    async predict(handPoints) {
        if (!this.isModelReady || handPoints?.length !== 42) return null;

        const INPUT_DATA = tf.tensor2d([handPoints]);
        try {
            const PREDICTION = this.engine.predict(INPUT_DATA);
            const PROBABILITIES = await PREDICTION.data();
            PREDICTION.dispose();

            let highestScore = 0;
            let highestIndex = 0;
            for (let i = 0; i < PROBABILITIES.length; i++) {
                if (PROBABILITIES[i] > highestScore) {
                    highestScore = PROBABILITIES[i];
                    highestIndex = i;
                }
            }

            return {
                label: this.labelList[highestIndex],
                confidence: highestScore,
                allProbabilities: this.labelList.map((labelName, index) => ({
                    label: labelName,
                    percentage: PROBABILITIES[index]
                }))
            };
        } finally {
            INPUT_DATA.dispose();
        }
    }
}

window.GestureModel = GestureModel;