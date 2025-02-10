const Apartment = require("../models/Apartment");
const { upload } = require('../config/gridfs');
const mongoose = require('mongoose');
const path = require('path');

// Upload images and create an apartment listing
exports.addApartment = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: "Error uploading images" });
    }

    try {
      const { title, description, location, rent } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one image is required" });
      }

      // Store image IDs from GridFS
      const imageIds = req.files.map((file) => file.id);

      const apartment = new Apartment({
        landlord: req.user ? req.user.id : null,
        title,
        description,
        location,
        rent,
        imageIds,
      });

      await apartment.save();
      res.status(201).json({ message: "Apartment added successfully", apartment });
    } catch (error) {
      res.status(500).json({ error: "Error adding apartment" });
    }
  });
};

// Get all apartments
exports.getApartments = async (req, res) => {
    try {
        const apartments = await Apartment.find();
        res.json(apartments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get image
exports.getImage = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../uploads', req.params.filename);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create new apartment
exports.createApartment = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const imageUrl = req.file ? 
            `http://localhost:5000/api/apartments/image/${req.file.filename}` : 
            'https://via.placeholder.com/400x300?text=No+Image';

        const apartment = new Apartment({
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            price: parseFloat(req.body.price),
            landlord: req.body.landlord,
            imageUrl: imageUrl,
            isAvailable: true
        });

        const savedApartment = await apartment.save();
        console.log('Apartment saved:', savedApartment);
        res.status(201).json(savedApartment);
    } catch (error) {
        console.error('Error creating apartment:', error);
        res.status(500).json({ error: error.message });
    }
};

// Search apartments
exports.searchApartments = async (req, res) => {
    try {
        const {
            city,
            priceMin,
            priceMax,
            propertyType,
            amenities,
            availableFrom,
            availableTo
        } = req.query;

        let query = { "availability.isAvailable": true };

        if (city) query["location.city"] = new RegExp(city, 'i');
        if (priceMin || priceMax) {
            query["price.amount"] = {};
            if (priceMin) query["price.amount"].$gte = parseFloat(priceMin);
            if (priceMax) query["price.amount"].$lte = parseFloat(priceMax);
        }
        if (propertyType) query.propertyType = propertyType;
        if (amenities) query.amenities = { $all: amenities.split(',') };
        if (availableFrom) query["availability.availableFrom"] = { $lte: new Date(availableFrom) };
        if (availableTo) query["availability.availableTo"] = { $gte: new Date(availableTo) };

        const apartments = await Apartment.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        // Transform the response to include image URLs
        const apartmentsWithImageUrls = apartments.map(apt => ({
            ...apt.toObject(),
            images: apt.images.map(imageId => `/apartments/image/${imageId}`)
        }));

        res.json(apartmentsWithImageUrls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single apartment
exports.getApartment = async (req, res) => {
    try {
        const apartment = await Apartment.findById(req.params.id);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        res.json(apartment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update apartment
exports.updateApartment = async (req, res) => {
    try {
        const apartment = await Apartment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        res.json(apartment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete apartment
exports.deleteApartment = async (req, res) => {
    try {
        const apartment = await Apartment.findByIdAndDelete(req.params.id);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }
        res.json({ message: 'Apartment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add this new function to handle renting an apartment
exports.rentApartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantAddress, startDate, duration } = req.body;

        const apartment = await Apartment.findById(id);
        if (!apartment) {
            return res.status(404).json({ error: 'Apartment not found' });
        }

        if (!apartment.isAvailable) {
            return res.status(400).json({ error: 'Apartment is not available' });
        }

        // Update apartment status
        apartment.isAvailable = false;
        apartment.currentTenant = {
            address: tenantAddress,
            startDate: new Date(startDate),
            duration: parseInt(duration),
            endDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + parseInt(duration)))
        };

        await apartment.save();
        res.json({ message: 'Apartment rented successfully', apartment });
    } catch (error) {
        console.error('Error renting apartment:', error);
        res.status(500).json({ error: error.message });
    }
};
