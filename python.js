const { spawn } = require('child_process');

var list = 'images/image.png'
const childPython = spawn('python', ['./ObjectDetection/codespace.py', list]);

childPython.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

childPython.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

childPython.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});