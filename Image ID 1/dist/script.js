console.log("Starting TensorFlow.js");

        const img = document.getElementById('img');
        const result = document.getElementById('result');
        const imageUpload = document.getElementById('imageUpload');
        const startCamera = document.getElementById('startCamera');
        const webcamElement = document.getElementById('webcam');
        const camera = document.getElementById('camera');
        const capture = document.getElementById('capture');

        // Function to display classification results
        function displayResults(predictions) {
            result.innerHTML = "";
            predictions.forEach(p => {
                result.innerHTML += `${p.className} - ${p.probability.toFixed(6)}<br>`;
            });
        }

        // Load the model - do this only once!
        let model;
        mobilenet.load().then(loadedModel => {
            model = loadedModel;
            classifyImage(); // Classify the initial image
        });

        // Function to classify the uploaded or captured image
        function classifyImage() {
            model.classify(img).then(predictions => {
                displayResults(predictions);    
            });
        }

        // Event listener for new image uploads
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                img.onload = classifyImage; // Classify new image once it's loaded
            };
            reader.readAsDataURL(file);
        });

        // Start the webcam
        startCamera.addEventListener('click', () => {
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                    webcamElement.srcObject = stream;
                    camera.style.display = 'block';
                }).catch((err) => {
                    console.error("Error starting webcam: ", err);
                });
            }
        });

        // Capture the current frame from the webcam
        capture.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = webcamElement.videoWidth;
            canvas.height = webcamElement.videoHeight;
            canvas.getContext('2d').drawImage(webcamElement, 0, 0);
            img.src = canvas.toDataURL();
            img.onload = classifyImage;
        });