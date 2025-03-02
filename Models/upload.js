const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'user_uploads',
        format: async (req, file) => file.mimetype.split('/')[1], // Auto-detect format
        public_id: (req, file) => Date.now() + '-' + file.originalname, // Unique filename
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 2MB file size limit
});

module.exports = upload;
