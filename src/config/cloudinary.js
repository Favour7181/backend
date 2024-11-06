const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer-storage-cloudinary
const cloudstorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'kyc-selfies',  // Folder in Cloudinary to store images
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});


module.exports = {
    cloudstorage,
}