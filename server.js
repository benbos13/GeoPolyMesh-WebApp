import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { exec, spawn } from "child_process";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the storage location for the uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Initialize multer middleware
const upload = multer({ storage });

const start = (port) => {
    app.use(express.json());
    app.use(cors({ origin: '*' }));

    // POST the file to the server and execute the cpp program
    app.post('/api/upload', upload.single('file'), async (req, res, next) => {
        const file = req.file;
        if (!file) {
            const error = new Error('Please attach a file');
            error.statusCode = 400;
            return next(error);
        }
        try {
            // Execute the command asynchronously in a new terminal window
            const filePath = path.resolve(file.path);
            console.log(filePath);
            const executablePath = path.resolve(process.env.GPM_DIR, "build/Desktop_Qt_6_7_1_MSVC2019_64bit-Release/Conformity/So2Cov/release/So2Cov.exe");
            const command = `"${executablePath}" "${filePath}"`;

            let terminalCommand;

            switch (process.platform) {
                case 'win32':
                    terminalCommand = `start cmd.exe /k "${command}"`;
                    break;
                case 'darwin':
                    terminalCommand = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
                    break;
                case 'linux':
                    terminalCommand = `gnome-terminal -- bash -c "${command}; exec bash"`;
                    break;
                default:
                    throw new Error('Unsupported platform: ' + process.platform);
            }

            exec(terminalCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send('Error while uploading and executing the file');
                }
                res.status(200).send('File uploaded and executed successfully');
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error while uploading and executing the file');
        }
    });
    
    app.get('/api/download', (req, res, next) => {
        const directoryPath = path.join(__dirname, 'uploads');
    
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                const error = new Error('Unable to scan directory');
                error.statusCode = 500;
                return next(error);
            }    
            
            const soFiles = files.filter(file => path.extname(file) === '.so');// Filter files with .so extension
    
            if (soFiles.length === 0) {
                const error = new Error('No .so file found');
                error.statusCode = 404;
                return next(error);
            } else if (soFiles.length > 1) {
                const error = new Error('Multiple .so files found');
                error.statusCode = 400;
                return next(error);
            }
    
            const filePath = path.join(directoryPath, soFiles[0]);
            res.download(filePath, (err) => {
                if (err) {
                    const error = new Error('Error downloading file');
                    error.statusCode = 500;
                    return next(error);
                }
                else {
                    console.log('Downloaded');
                }
            });
        });
    });

    app.listen(port, () => console.log('Server is listening on port number ' + port));
};

// Starting the server
const port = 3000;
start(port);
