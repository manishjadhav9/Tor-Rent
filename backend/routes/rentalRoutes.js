const express = require("express");
const { rentApartment } = require("../controllers/rentalController");

const router = express.Router();

router.post("/rent", rentApartment);

module.exports = router;
