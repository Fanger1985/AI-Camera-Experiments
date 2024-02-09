console.log("TensorFlow.js in action!");

        const img = document.getElementById('img');
        const result = document.getElementById('result');
        const imageUpload = document.getElementById('imageUpload');
        const startCamera = document.getElementById('startCamera');
        const toggleLive = document.getElementById('toggleLive');
        const webcamElement = document.getElementById('webcam');
        const camera = document.getElementById('camera');
        const capture = document.getElementById('capture');

        let liveAnalysis = false;
        let webcamStream;

        function displayResults(predictions) {
            result.innerHTML = "";
            predictions.forEach(p => {
                result.innerHTML += `${p.className} - ${p.probability.toFixed(6)}<br>`;
            });
        }

        let model;
        mobilenet.load().then(loadedModel => {
            model = loadedModel;
            classifyImage();
        });

        function classifyImage() {
            model.classify(img).then(predictions => {
                displayResults(predictions);    
            });
        }

        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = classifyImage;
            };
            reader.readAsDataURL(file);
        });

        startCamera.addEventListener('click', () => {
            if (!webcamStream) {
                if (navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                        webcamStream = stream;
                        webcamElement.srcObject = stream;
                        camera.style.display = 'block';
                    }).catch((err) => {
                        console.error("Webcam error: ", err);
                    });
                }
            } else {
                webcamElement.srcObject = webcamStream;
                camera.style.display = 'block';
            }
        });

        capture.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = webcamElement.videoWidth;
            canvas.height = webcamElement.videoHeight;
            canvas.getContext('2d').drawImage(webcamElement, 0, 0);
            img.src = canvas.toDataURL();
            img.onload = classifyImage;
        });

        function liveAnalysisLoop() {
            if (liveAnalysis) {
                const canvas = document.createElement('canvas');
                canvas.width = webcamElement.videoWidth;
                canvas.height = webcamElement.videoHeight;
                canvas.getContext('2d').drawImage(webcamElement, 0, 0);
                model.classify(canvas).then(predictions => {
                    displayResults(predictions);
                    requestAnimationFrame(liveAnalysisLoop);
                });
            }
        }

        toggleLive.addEventListener('click', () => {
            liveAnalysis = !liveAnalysis;
            if (liveAnalysis) {
                liveAnalysisLoop();
            }
        });