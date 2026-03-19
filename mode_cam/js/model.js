class GestureModel {
    constructor() {
        this.mesin = null;
        this.daftarLabel = [];
        this.isModelReady = false;
    }

    async muatData(jalurFolder) {
        this.mesin = await tf.loadLayersModel(jalurFolder + '/model.json');

        const RESPON = await fetch(jalurFolder + '/metadata.json');
        const DATA_META = await RESPON.json();

        this.daftarLabel = DATA_META.labels;

        this.mesin.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this.isModelReady = true;
    }

    async tebak(dotTangan) {
        if (!this.isModelReady || dotTangan?.length !== 42) return null;

        const INPUT_DATA = tf.tensor2d([dotTangan]);
        try {
            const HASIL_TEBAKAN = this.mesin.predict(INPUT_DATA);
            const KEMUNGKINAN = await HASIL_TEBAKAN.data();
            HASIL_TEBAKAN.dispose();

            let persentaseTertinggi = 0;
            let indeksTertinggi = 0;
            for (let i = 0; i < KEMUNGKINAN.length; i++) {
                if (KEMUNGKINAN[i] > persentaseTertinggi) {
                    persentaseTertinggi = KEMUNGKINAN[i];
                    indeksTertinggi = i;
                }
            }

            return {
                labelJudul: this.daftarLabel[indeksTertinggi],
                keyakinan: persentaseTertinggi,
                allProbabilities: this.daftarLabel.map((namaLabel, urutan) => ({
                    labelJudul: namaLabel,
                    persentase: KEMUNGKINAN[urutan]
                }))
            };
        } finally {
            INPUT_DATA.dispose();
        }
    }
}

window.GestureModel = GestureModel;