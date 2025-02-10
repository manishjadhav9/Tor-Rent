const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const { 
    getApartments, 
    createApartment, 
    getApartment,
    getImage,
    rentApartment
} = require('../controllers/apartmentController');

// Get all apartments
router.get('/', getApartments);

// Create new apartment
router.post('/create', upload.single('image'), createApartment);

// Get single apartment
router.get('/:id', getApartment);

// Get apartment image
router.get('/image/:filename', getImage);

// Add this new route
router.post('/:id/rent', rentApartment);

module.exports = router;
