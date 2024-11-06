const multer = require('multer');
const path = require('path');

// Configure multer to store files in a temporary directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads')); // 'uploads' folder at project root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename with timestamp
  }
});

const upload = multer({ storage });

module.exports = upload;
