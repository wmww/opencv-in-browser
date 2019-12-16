var video;
var front_canvas;
var front_context;
var back_canvas;
var back_context;

function error(task, message) {
    var full_message = "Error " + String(task) + ": " + String(message)
    console.error(full_message)
    alert(full_message);
}

function setup() {
    video = document.createElement('video');
    video.autoplay = true

    front_canvas = document.getElementById('canvas');
    front_context = canvas.getContext('2d'); // TODO: could the type instead be "bitmaprenderer"?

    back_canvas = document.createElement('canvas');
    back_context = back_canvas.getContext('2d');

    video.addEventListener("loadeddata", function() {
        console.log("loadeddata fired!");
        try {
            front_canvas.width = video.videoWidth;
            front_canvas.height = video.videoHeight;
            back_canvas.width = video.videoWidth;
            back_canvas.height = video.videoHeight;
            draw();
        } catch (err) {
            error("drawng frame", err);
        }
    });
}

function start_capture() {
    navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            console.log("Video: " + String(video));
            video.srcObject = stream;
        })
        .catch(function(err) {
            error("opening webcam", err.name);
        });
}

function draw() {
    if (video.paused || video.ended) {
        console.log("Video stopped");
        return
    }
    console.log("Drawing...");
    var w = video.videoWidth;
    var h = video.videoHeight;
    back_context.drawImage(video, 0, 0, w, h);
    var data = back_context.getImageData(0, 0, w, h);
    front_context.putImageData(data, 0, 0);
    requestAnimationFrame(draw);
}

function init() {
    try {
        setup();
        start_capture();
    } catch (err) {
        error("initializing", err);
    }
}

init();
