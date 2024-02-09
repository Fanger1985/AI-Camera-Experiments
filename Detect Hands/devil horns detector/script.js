// app.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let lastGesture = null;

// Load the handpose model.
async function loadModel() {
    const model = await handpose.load();
    console.log("Handpose model loaded.");
    return model;
}

// Start the webcam video.
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

// Detect hands in the video.
async function detectHands(model) {
    const predictions = await model.estimateHands(video);
    if (predictions.length > 0) {
        // Draw the predictions to the canvas.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < predictions.length; i++) {
            const keypoints = predictions[i].landmarks;

            // Draw hand keypoints.
            for (let j = 0; j < keypoints.length; j++) {
                const [x, y] = keypoints[j];
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

    if (isDevilHornsGesture(predictions[0].landmarks)) {
        if (lastGesture !== 'devilHorns') {
            lastGesture = 'devilHorns';
            speak("Rock On!");
            updateGestureSequence('devilHorns'); // Add this line
        }
    }
    else if (isThumbsUpGesture(predictions[0].landmarks)) {
        if (lastGesture !== 'thumbsUp') {
            lastGesture = 'thumbsUp';
            speak("Thumbs Up, dude!");
            updateGestureSequence('thumbsUp'); // You already have this line
        }
    }
    else if (isThumbsDownGesture(predictions[0].landmarks)) {
        if (lastGesture !== 'thumbsDown') {
            lastGesture = 'thumbsDown';
            speak("Thumbs Down, man");
            updateGestureSequence('thumbsDown'); // Add this line
        }
    }
    else if (isPeaceSignGesture(predictions[0].landmarks)) {
        if (lastGesture !== 'peaceSign') {
            lastGesture = 'peaceSign';
            speak("Peace bro");
            updateGestureSequence('peaceSign'); // Add this line
        }
    }
    else {
        lastGesture = null;
    }
    }
}

// Check for the devil horns gesture.
function isDevilHornsGesture(keypoints) {
    // Check if the index finger is up
    const indexFingerUp = keypoints[8][1] < keypoints[6][1];
    // Check if the pinky is up
    const pinkyFingerUp = keypoints[20][1] < keypoints[18][1];
    // Check if other fingers are down
    const middleFingerDown = keypoints[12][1] > keypoints[10][1];
    const ringFingerDown = keypoints[16][1] > keypoints[14][1];
    // Check if the thumb is not considered or is in a specific position if needed
    // const thumbPosition = ...; // Add logic if thumb position is important

    // Return true if both the index and pinky are up, and other fingers are down
    return indexFingerUp && pinkyFingerUp && middleFingerDown && ringFingerDown;
}


// Check for the peace sign gesture.
function isPeaceSignGesture(keypoints) {
    // Add your logic here to detect a peace sign gesture.
    // This is a placeholder logic, you'll need to adjust the indices and conditions based on the keypoints for accurate detection.
    const indexFingerUp = keypoints[8][1] < keypoints[6][1];
    const middleFingerUp = keypoints[12][1] < keypoints[10][1];
    const otherFingersDown = keypoints[16][1] > keypoints[14][1] && keypoints[20][1] > keypoints[18][1];

    return indexFingerUp && middleFingerUp && otherFingersDown;
}
function isThumbsUpGesture(keypoints) {
    // Check if the thumb is up
    const thumbUp = keypoints[4][1] < keypoints[2][1];
    // Check if other fingers are down
    const fingersDown = keypoints[8][1] > keypoints[6][1] && keypoints[12][1] > keypoints[10][1] &&
                        keypoints[16][1] > keypoints[14][1] && keypoints[20][1] > keypoints[18][1];

    return thumbUp && fingersDown;
}

function isThumbsDownGesture(keypoints) {
    // Check if the thumb is down
    const thumbDown = keypoints[4][1] > keypoints[2][1];
    // Check if other fingers are down
    const fingersDown = keypoints[8][1] > keypoints[6][1] && keypoints[12][1] > keypoints[10][1] &&
                        keypoints[16][1] > keypoints[14][1] && keypoints[20][1] > keypoints[18][1];

    return thumbDown && fingersDown;
}

const correctCombination = ['thumbsUp', 'peaceSign', 'thumbsDown', 'devilHorns'];
let gestureSequence = [];

function updateGestureSequence(gesture) {
    gestureSequence.push(gesture);
    
    // If the sequence is longer than the correct combination, remove the oldest gesture.
    if (gestureSequence.length > correctCombination.length) {
        gestureSequence.shift();
    }

    // Check if the current sequence matches the correct combination.
    if (arraysMatch(gestureSequence, correctCombination)) {
        window.open('http://www.thefanger.com', '_blank');
        gestureSequence = []; // Reset the sequence after the combination is entered.
    }
}

function arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Function to speak out text.
function speak(text) {
    if (speechSynthesis.speaking) {
        // If it's currently speaking, don't interrupt.
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

// The main function to run everything.
async function main() {
    await setupCamera();
    video.play();

    const model = await loadModel();
    setInterval(() => {
        detectHands(model);
    }, 100); // Run detection every 100ms.
}

// Kick it off!
main();