let video;
let front_canvas;
let front_context;
let back_canvas;
let back_context;
// const face_model_path = "vendor/lbpcascade_frontalface_improved.xml";
const face_model_path = "vendor/haarcascade_frontalface_default.xml";
let face_model_file = null;
let face_cascade = null;

function error(task, message) {
    const full_message = "Error " + String(task) + ": " + String(message)
    console.error(full_message)
    alert(full_message);
}

function setup() {
    const load_into_path = "foobar.xml";
    file_from_url(load_into_path, face_model_path, () => {
        face_model_file = load_into_path;
    });

    video = document.createElement('video');

    front_canvas = document.getElementById('canvas');
    front_context = canvas.getContext('2d');

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
            error("drawing", err);
        }
    });
}

function start_capture() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then((stream) => {
            console.log("Video: " + String(video));
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            error("opening webcam", err.name);
        });
}

function file_from_url(path, url, callback) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function(ev) {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                let data = new Uint8Array(request.response);
                console.log("Got " + data.length + " bytes of data");
                try {
                    cv.FS_createDataFile('/', path, data, true, false, false);
                } catch (err) {
                    if (typeof err === 'number') {
                        err = cv.exceptionFromPtr(err).msg;
                    }
                    error("creating file", err);
                }
                callback();
            } else {
                error("creating file from URL", "GET status code " + request.status);
            }
        }
    };
    request.onerror = function(err) {
        error(
            "requesting file from URL",
            "If trying to load a local file, try setting privacy.file_unique_origin to false " +
            "(see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp)");
    };
    request.send();
};

function process_data(data) {
    if (!face_cascade) {
        if (!face_model_file) {
            return;
        }
        face_cascade = new cv.CascadeClassifier();
        face_cascade.load(face_model_file);
    }
    // var mat=new cv.Mat(imageData.height,imageData.width,cv.CV_8UC4);mat.data.set(imageData.data);
    const source = cv.matFromImageData(data);
    let gray = new cv.Mat();
    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY, 0);
    const faces = new cv.RectVector();
    const scale_factor = 1.1;
    const min_neighbors = 3;
    const flags = 0;
    const min_size = new cv.Size(0, 0);
    const max_size = min_size;
    face_cascade.detectMultiScale(gray, faces, scale_factor, min_neighbors, flags, min_size, max_size);
    console.log("Detected " + faces.size() + " faces!");
    let face_rect = null;
    if (faces.size()) {
        let r = faces.get(0);
        face_rect = {x: r.x, y: r.y, w: r.width, h: r.height};
    }
    //const mat = new cv.Mat();
    // scale and shift are used to map the data to [0, 255].
    //source.convertTo(mat, cv.CV_8U, scale, shift);
    //let gray = new cv.Mat();
    //cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    source.delete();
    gray.delete();
    //face_cascade.delete();
    faces.delete();

    // *** is GRAY, RGB, or RGBA, according to src.channels() is 1, 3 or 4.
    //cv.cvtColor(dst, dst, cv.COLOR_2RGBA);
    //const img_data = new ImageData(new Uint8ClampedArray(mat.data, mat.cols, mat.rows));
    return face_rect;
}

function draw() {
    if (video.paused || video.ended) {
        console.log("Video stopped");
        return
    }
    console.log("Drawing...");
    const w = video.videoWidth;
    const h = video.videoHeight;
    back_context.drawImage(video, 0, 0, w, h);
    data = back_context.getImageData(0, 0, w, h);
    let face_rect;
    try {
        face_rect = process_data(data);
    } catch (err) {
        if (typeof err === 'number') {
            err = cv.exceptionFromPtr(err).msg;
        }
        throw err;
    }
    front_context.putImageData(data, 0, 0);
    if (face_rect) {
        front_context.beginPath();
        front_context.rect(face_rect.x, face_rect.y, face_rect.w, face_rect.h);
        front_context.stroke();
    }
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
