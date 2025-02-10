const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Important: Load environment variables at the top
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let gridfsBucket;

const initGridFS = async (connection) => {
    try {
        if (!connection || !connection.db) {
            throw new Error('Valid database connection required');
        }

        gridfsBucket = new mongoose.mongo.GridFSBucket(connection.db, {
            bucketName: 'uploads'
        });

        // Test the bucket
        await gridfsBucket.find({}).toArray();
        
        console.log('GridFS Bucket initialized successfully');
        return gridfsBucket;
    } catch (error) {
        console.error('Error initializing GridFS:', error);
        throw error;
    }
};

// Verify the environment variable is loaded
if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
}

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: {
                        contentType: file.mimetype
                    }
                };
                resolve(fileInfo);
            });
        });
    }
});

// Handle storage events
storage.on('connection', () => {
    console.log('GridFS Storage connected successfully');
});

storage.on('connectionFailed', (err) => {
    console.error('GridFS Storage connection failed:', err);
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    initGridFS,
    storage,
    getGFS: () => gridfsBucket,
    upload
};
