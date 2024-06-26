let video;
let faceapi;
let detections = [];

function setup() {
    const canvas = createCanvas(640, 480);
    canvas.id('overlay');
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // Load the face-api model
    faceapi = ml5.faceApi(video, { withLandmarks: true, withExpressions: true, withDescriptors: false }, modelReady);
}

function modelReady() {
    console.log('Model Loaded!');
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) {
        console.error(err);
        return;
    }

    detections = result;

    clear();
    image(video, 0, 0, width, height);

    if (detections && detections.length > 0) {
        drawBox(detections);
        drawLandmarks(detections);
        drawExpressions(detections);
    }

    faceapi.detect(gotResults);
}

function drawBox(detections) {
    for (let i = 0; i < detections.length; i++) {
        const alignedRect = detections[i].alignedRect;
        const { _x, _y, _width, _height } = alignedRect._box;
        stroke(44, 169, 225);
        strokeWeight(2);
        noFill();
        rect(_x, _y, _width, _height);
    }
}

function drawLandmarks(detections) {
    for (let i = 0; i < detections.length; i++) {
        const parts = detections[i].landmarks.positions;
        for (let j = 0; j < parts.length; j++) {
            const { _x, _y } = parts[j];
            stroke(0, 255, 0);
            strokeWeight(2);
            point(_x, _y);
        }
    }
}

function drawExpressions(detections) {
    for (let i = 0; i < detections.length; i++) {
        const { expressions } = detections[i];
        let x = detections[i].alignedRect._box._x;
        let y = detections[i].alignedRect._box._y - 10;
        for (const [expression, value] of Object.entries(expressions)) {
            textSize(16);
            noStroke();
            fill(255, 0, 0);
            text(`${expression}: ${nf(value * 100, 2, 2)}%`, x, y);
            y += 18;
        }
    }
}

function switchCamera() {
    let constraints = {
        video: {
            facingMode: usingFrontCamera ? "user" : "environment"
        }
    };
    currentStream = navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    usingFrontCamera = !usingFrontCamera;
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
    document.getElementById('error-message').textContent = message;
    console.log(message);
}

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
        video.srcObject = currentStream;
        logMessage('Camera started successfully.');
        videoOn = true;
        startRecordingButton.textContent = '🛑';
    } catch (error) {
        logMessage('Error accessing camera: ' + error.message);
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        logMessage('Stopped video stream.');
    }
    video.srcObject = null;
    videoOn = false;
    startRecordingButton.textContent = '🎦';
}
