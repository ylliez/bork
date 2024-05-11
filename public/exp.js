// declare socket w/ namespace attribution
const socket = io("/exp");
// signify connection attempt
socket.on("connect", () => {
    console.log(`client ID: ${socket.id}`);
    // get & set UI & UX elements
    const captureElement = document.getElementById('capture');
    const canvasElement = document.getElementById('canvas');
    const canvasCtx = canvasElement.getContext('2d');
    let width = innerWidth, height = innerHeight;
    canvasElement.width = width;
    canvasElement.height = height;

    // initialize MediaPipe FaceMesh, set options, and attach to camera
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        selfieMode: true,
        maxNumFaces: 5,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);
    const camera = new Camera(captureElement, {
        onFrame: async () => {
            await faceMesh.send({ image: captureElement });
        },
        width: width,
        height: height
    });
    camera.start();
    // utilize MediaPipe results for socket send data and canvas drawing
    function onResults(results) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.multiFaceLandmarks) {
            // console.log(results.multiFaceLandmarks)
            for (const landmarks of results.multiFaceLandmarks) {
                // draw lip outline
                drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#15ff00' });
                // socket.emit("FACE", FACEMESH_LIPS);
                // // draw all outlines
                // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
                // drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
            }
            if (results.multiFaceLandmarks[0]) {
                let lipTop = results.multiFaceLandmarks[0][13];
                let lipBot = results.multiFaceLandmarks[0][14];
                // let lipLeft = results.multiFaceLandmarks[0][61];
                let lipLeft = results.multiFaceLandmarks[0][78];
                let lipRight = results.multiFaceLandmarks[0][308];
                // // testing --> https://storage.googleapis.com/mediapipe-assets/documentation/mediapipe_face_landmark_fullsize.png
                // canvasCtx.fillStyle = "#F00";
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipTop.x * width, lipTop.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipBot.x * width, lipBot.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipLeft.x * width, lipLeft.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipRight.x * width, lipRight.y * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                let lipApVer = lipBot.y - lipTop.y;
                let lipMidY = lipTop.y + (lipApVer / 2);
                let lipApHor = lipRight.x - lipLeft.x;
                let lipMidX = lipLeft.x + (lipApHor / 2);
                // console.log(`Vert:${lipApVer}, Horiz:${lipApHor}`);
                // // testing
                // canvasCtx.fillStyle = "#F00";
                // canvasCtx.beginPath();
                // canvasCtx.arc(lipMidX * width, lipMidY * height, 10, 0, 2 * Math.PI);
                // canvasCtx.fill();
                let lipApNorm = lipApVer / lipApHor;
                if (lipApVer > 0.01) {
                    // socket.emit(`${ socket.id }`, `${ lipApVer }`, `${ lipMidY }`);
                    socket.emit(`${socket.id}`, `${lipApNorm}`);
                }
                else {
                    socket.emit(`${socket.id}`, `0`);
                }
            }
            canvasCtx.restore();
        }
    }
});