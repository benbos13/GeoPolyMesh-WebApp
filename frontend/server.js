import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();

// Define the storage location for the uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

// Initialize multer middleware
const upload = multer({ storage });

const start = (port) => {
    app.use(express.json());
    app.use(cors({ origin: '*' }));

    // Define a route to handle file uploads
    app.post('/upload', upload.single('file'), (req, res, next) => {
        const file = req.file;
        if (!file) {
            const error = new Error('Please attach a file');
            error.statusCode = 400;
            return next(error);
        }
        res.send('File uploaded successfully');
    });

    app.listen(port, () => console.log('Server is listening on port number ' + port));
};

export { start };
