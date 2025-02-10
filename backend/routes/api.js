const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const apartmentRoutes = require('./apartmentRoutes');
const rentalRoutes = require('./rentalRoutes');
const imageRoutes = require('./imageRoutes');

// API documentation route
router.get('/', (req, res) => {
    res.json({
        message: 'Debug-Thugs API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register'
            },
            apartments: {
                list: 'GET /api/apartments',
                create: 'POST /api/apartments',
                getOne: 'GET /api/apartments/:id',
                update: 'PUT /api/apartments/:id',
                delete: 'DELETE /api/apartments/:id'
            },
            rentals: {
                create: 'POST /api/rentals/rent',
                list: 'GET /api/rentals'
            },
            images: {
                upload: 'POST /api/images/upload',
                get: 'GET /api/images/:id'
            }
        }
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/rentals', rentalRoutes);
router.use('/images', imageRoutes);

module.exports = router; 