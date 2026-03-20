class DatasetManager {
    constructor() {
        this.samples = [];
        this.labels = new Set();
    }

    addSample(label, landmarks) {
        if (!label || !landmarks || landmarks.length !== 42) {
            throw new Error('Invalid: butuh label dan 42 landmarks');
        }

        const sample = {
            label: label.trim().toLowerCase(),
            landmarks: landmarks,
            timestamp: Date.now()
        };

        this.samples.push(sample);
        this.labels.add(sample.label);
        return sample;
    }

    getLabels() {
        return Array.from(this.labels).sort();
    }

    getSampleCounts() {
        const counts = {};
        for (const label of this.labels) {
            counts[label] = this.samples.filter(s => s.label === label).length;
        }
        return counts;
    }

    getTotalCount() {
        return this.samples.length;
    }

    clear() {
        this.samples = [];
        this.labels = new Set();
    }

    exportToJSON() {
        return JSON.stringify({
            version: '1.0',
            exportDate: new Date().toISOString(),
            samples: this.samples,
            labels: this.getLabels(),
            totalSamples: this.samples.length
        }, null, 2);
    }

    importFromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data.samples)) {
            throw new Error('Format tidak valid');
        }
        this.samples = data.samples;
        this.labels = new Set(this.samples.map(s => s.label));
    }

    downloadAsFile(filename = 'dataset.json') {
        const blob = new Blob([this.exportToJSON()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    getTrainingData() {
        const labelList = this.getLabels();
        const labelToIndex = {};
        labelList.forEach((label, i) => labelToIndex[label] = i);

        return {
            X: this.samples.map(s => s.landmarks),  // Input features
            y: this.samples.map(s => labelToIndex[s.label]), // Label indices
            labels: labelList,
            numClasses: labelList.length
        };
    }
}

window.DatasetManager = DatasetManager;