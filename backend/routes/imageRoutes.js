const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { getImage } = require("../controllers/imageController");
require("dotenv").config();

const router = express.Router();

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return { bucketName: "uploads", filename: `${Date.now()}-${file.originalname}` };
  },
});
const upload = multer({ storage });

// Upload Images Route
router.post("/upload", upload.array("images", 5), async (req, res) => {
  try {
    const imageIds = req.files.map((file) => file.id.toString());
    res.json({ message: "Images uploaded successfully", imageIds });
  } catch (error) {
    res.status(500).json({ error: "Image upload failed" });
  }
});

// Get Image Route
router.get("/image/:id", getImage);

module.exports = router;
