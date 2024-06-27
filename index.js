let video = document.getElementById('video');
let usingFrontCamera = true;
let currentStream;
let videoOn = false;

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
        video.srcObject = currentStream;
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
    video.srcObject = null;
    videoOn = false;
    document.getElementById('startRecordingButton').textContent = '🎦';
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
            video.srcObject = stream;
            usingFrontCamera = !usingFrontCamera;
            logMessage('Switched camera successfully.');
        })
        .catch(err => {
            logError('Error accessing camera: ' + err);
        });
}

document.getElementById('switchCameraButton').addEventListener('click', switchCamera);
document.getElementById('startRecordingButton').addEventListener('click', () => {
    if (videoOn) {
        stopCamera();
    } else {
        startCamera();
    }
});

logMessage('Initial setup complete.');
