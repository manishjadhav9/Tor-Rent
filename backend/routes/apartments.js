const express = require('express');
const router = express.Router();
const multer = require('multer');
const Apartment = require('../models/Apartment');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add apartment with images
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const apartmentData = JSON.parse(req.body.apartmentData);
    const images = req.files.map(file => {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    });

    const apartment = new Apartment({
      ...apartmentData,
      images: images
    });

    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    console.error('Error adding apartment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    apartment.reviews.push(req.body);
    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all apartments
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find();
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 