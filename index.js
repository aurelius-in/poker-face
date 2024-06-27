let video;
let usingFrontCamera = true;
let currentStream;
let videoOn = false;

function setup() {
    const canvas = createCanvas(480, 480); // Ensure it's square
    canvas.id('overlay');
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    logMessage('Video capture setup complete.');

    // Check if ml5 is correctly loaded
    if (typeof ml5 === 'undefined') {
        logMessage('ml5 library not loaded. Please check the script source.');
        return;
    }

    logMessage('ml5 library loaded successfully.');
}

function switchCamera() {
    let constraints = {
        video: {
            facingMode: usingFrontCamera ? "user" : "environment"
        }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.elt.srcObject = stream;
            usingFrontCamera = !usingFrontCamera;
            logMessage('Switched camera successfully.');
        })
        .catch(err => {
            logError('Error accessing camera: ' + err);
        });
}

document.getElementById('switchCameraButton').addEventListener('click', switchCamera);

function startRecording() {
    if (videoOn) {
        stopCamera();
    } else {
        startCamera();
    }
}

document.getElementById('startRecordingButton').addEventListener('click', startRecording);

function logMessage(message) {
    const log = document.getElementById('console-log');
    log.textContent += message + '\n';
    console.log(message);
}

function logError(message) {
    const log = document.getElementById('console-log');
    log.textContent += '[ERROR] ' + message + '\n';
    console.error(message);
}

// Override console.log and console.error
console.log = logMessage;
console.error = logError;

async function startCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser does not support media devices API.');
        }

        const constraints = {
            video: {
                facingMode: usingFrontCamera ? 'user' : 'environment'
            }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.elt.srcObject = currentStream;
        logMessage('Camera started successfully.');
        videoOn = true;
        document.getElementById('startRecordingButton').textContent = '🛑';
    } catch (error) {
        logError('Error accessing camera: ' + error.message);
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        logMessage('Stopped video stream.');
    }
    video.elt.srcObject = null;
    videoOn = false;
    document.getElementById('startRecordingButton').textContent = '🎦';
}
