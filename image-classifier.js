const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();

app.use(express.static('/tmp/'));

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage });

app.use(cors());

app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file){
        console.log("Current dir " + __dirname);
        console.log("Request file: " + req.file.filename);
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python3', ["./model_loader.py", "/tmp/" + req.file.filename, "color"]);
        pythonProcess.stdout.on('data', (data) => {
            // Do something with the data returned from python script
            console.log("Classification: " + data);
            res.json({ imageUrl: `${req.file.filename}`, classification: "" + data });
        });
    } else {
        console.log("No Files to Upload. Request: " + req);
        res.status("409").json("No Files to Upload.");
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT);
console.log('Api running on port: ' + PORT);