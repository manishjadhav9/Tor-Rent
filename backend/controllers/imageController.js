const { getGFS } = require("../config/gridfs");
const mongoose = require("mongoose");

exports.getImage = async (req, res) => {
  try {
    const gfs = getGFS();
    const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (!file) return res.status(404).json({ error: "Image not found" });

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Error fetching image" });
  }
};
