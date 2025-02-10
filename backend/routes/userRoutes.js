const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { walletAddress, userType } = req.body;
  try {
    const user = new User({ walletAddress, userType });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;