// Get the section where demos will be shown.
const demosSection = document.getElementById('demos');

// Initialize model variable.
var model = undefined;

// Load the coco-ssd model and remove the 'invisible' class from demosSection once the model is ready.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  demosSection.classList.remove('invisible');
});

// Retrieve all image containers and attach a click event listener to each image.
const imageContainers = document.getElementsByClassName('classifyOnClick');
for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i].children[0].addEventListener('click', handleClick);
}

// Define the behavior for a click event on an image.
function handleClick(event) {
  if (!model) {
    console.log('Model not loaded yet. Please wait.');
    return;
  }
  // Perform detection and add highlights and labels for each detected object.
  model.detect(event.target).then(function (predictions) {
    console.log(predictions);
    predictions.forEach(prediction => {
      const label = document.createElement('p');
      label.innerText = `${prediction.class} - with ${Math.round(prediction.score * 100)}% confidence.`;
      label.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2] - 10}px;`;

      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      highlighter.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2]}px; height: ${prediction.bbox[3]}px;`;

      event.target.parentNode.appendChild(highlighter);
      event.target.parentNode.appendChild(label);
    });
  });
}

// Webcam setup and utility functions.
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  const enableWebcamButton = document.getElementById('webcamButton');
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('Webcam is not supported by your browser');
}

// Enable webcam stream and begin classifying objects in view.
var children = [];
function enableCam(event) {
  if (!model) {
    console.log('Model is not loaded yet.');
    return;
  }
  event.target.classList.add('removed');  
  const constraints = { video: true };
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

// Speech synthesis setup.
let isSpeechEnabled = true;
const muteButton = document.getElementById('muteButton');
muteButton.addEventListener('click', function() {
  isSpeechEnabled = !isSpeechEnabled;
  this.textContent = isSpeechEnabled ? 'Mute' : 'Unmute';
});

function speak(text) {
  if (isSpeechEnabled) {
    let utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}

// Object to Phrases mapping.
const objectResponses = {
  'cat': ['i hate that cat', 'get that fucking cat away from me', 'rabid pee machine', 'go away devil beast', 'I see you kitty', 'cat', 'feline animal detected', 'meow', 'WOOF WOOF'],
  'dog': ['aaw what a cute doggo', 'come here puppy', 'who is a good doggy', 'woof', 'meow MEOW'],
  'person': ['butt head', 'human spotted', 'dork', 'nerd', 'shit'],
  'remote': ['control that shit yo', 'clicker in view', 'play a movie', 'are you really in control'],
  'cell phone': ['beep beep phone me', 'e t phone home'],
  'jar': ['what you got in there bro', 'you got weed in there yo'],
  'potted plant': ['nice plant'],
  'pillow': ['comfy pillow'],
  'fire': ['burning down the houes'],
  'elephant': ['it is the animal that never forgets does it'],
  'apple': ['what a tasty looking apple'],
  'orange': ['orange glad your not banana'],
    'banana': ['banana wacky my nana wacky'],
  'cup': ['quench that thirst'],
    'lantern': ['bug attract light'],
  'bottle': ['what you got in there bro', 'is it potion time']
};

// Function to get a random phrase for an object.
function getRandomPhrase(objectType) {
  const phrases = objectResponses[objectType];
  if (phrases) {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  return null;
}

// Track spoken objects and implement a cooldown mechanism.
let lastSpokenTimes = new Map();
const SPEECH_COOLDOWN = 13000; // Cooldown period in milliseconds.

// Function to update the marquee (ticker) with detected objects and phrases.
function updateMarquee(text) {
  const marquee = document.getElementById('ticker');
  if (marquee) {
    marquee.textContent = text;
  }
}

// Modified predictWebcam function with marquee update.
function predictWebcam() {
  model.detect(video).then(function(predictions) {
    // Clear previous frame's highlights and labels.
    children.forEach(child => liveView.removeChild(child));
    children.length = 0;

    let now = Date.now();

    predictions.forEach(prediction => {
      const detectedClass = prediction.class.toLowerCase();

      // Create label and highlighter for detected object.
      const label = document.createElement('p');
      label.innerText = `${prediction.class} - with ${Math.round(prediction.score * 100)}% confidence.`;
      label.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2] - 10}px;`;

      const highlighter = document.createElement('div');
      highlighter.setAttribute('class', 'highlighter');
      highlighter.style = `left: ${prediction.bbox[0]}px; top: ${prediction.bbox[1]}px; width: ${prediction.bbox[2]}px; height: ${prediction.bbox[3]}px;`;

      liveView.appendChild(highlighter);
      liveView.appendChild(label);
      children.push(highlighter, label);

      // Speak and update marquee only if the object has not been detected recently.
      if (!lastSpokenTimes.has(detectedClass) || now - lastSpokenTimes.get(detectedClass) > SPEECH_COOLDOWN) {
        let phrase = getRandomPhrase(detectedClass);
        if (phrase) {
          speak(phrase);
          updateMarquee(`Detected: ${prediction.class} - ${phrase}`);
          lastSpokenTimes.set(detectedClass, now);
        }
      }
    });

    // Continue to predict on each animation frame.
    window.requestAnimationFrame(predictWebcam);
  });
}

// Start the webcam.
predictWebcam();