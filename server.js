import express from "express";
import fs from "fs";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import So2Cov from "./exe.js";

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

var isSo2CovFinished = null; // Initialization here to be able to export it

const start = (port) => {
    app.use(express.json());
    app.use(cors({ origin: '*' }));
    // Authorization for the frontend to access the server
    app.use(function(req, res, next) {  
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    // For debug purposes
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });

    // POST the file to the server and execute the cpp program
    app.post('/api/upload', upload.single('file'), async (req, res, next) => {
        const SoFile = req.file;
        const executablePath = path.resolve(process.env.GPM_DIR, "build/Desktop_Qt_6_7_1_MSVC2019_64bit-Release/Conformity/So2Cov/release");
        if (!SoFile) {
            const error = new Error('Please attach a file');
            error.statusCode = 400;
            return next(error);
        }
        try {
             //So2Cov(SoFile, VTKFile, executablePath);
             isSo2CovFinished = new Promise((resolve, reject) => { So2Cov(SoFile, executablePath); resolve(); });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error while uploading and executing the file');
        }
        res.status(200).send('File uploaded and executed successfully');

    });


    app.post('/api/upload/json',  (req, res) => {
        console.log('Received data:', req.body);
        const fileCopy = req.body;
    
        if (!fileCopy) {
            return res.status(400).send({ message: 'No data received!' });
        }

        const filePath = path.join(__dirname, 'uploads', 'properties_chosen.json');
        fs.writeFile(filePath, JSON.stringify(fileCopy, null, 4), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error while writing the file' });
            }
            res.status(200).send({ message: 'File written successfully' });
        });
    });
    
    app.get('/api/download/so', (req, res, next) => {
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

    app.get('/api/download/properties', (req, res, next) => {
        const directoryPath = path.join(__dirname, 'downloads');
    
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                const error = new Error('Unable to scan directory');
                error.statusCode = 500;
                return next(error);
            }    
            
            const propertiesFiles = files.filter(file => path.extname(file) === '.json');// Filter files with .json extension
    
            if (propertiesFiles.length === 0) {
                const error = new Error('No .json file found');
                error.statusCode = 404;
                return next(error);
            } else if (propertiesFiles.length > 1) {
                const error = new Error('Multiple .json files found');
                error.statusCode = 400;
                return next(error);
            }
    
            const filePath = path.join(directoryPath, propertiesFiles[0]);
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
const port = 3001;
start(port);

export { isSo2CovFinished };
