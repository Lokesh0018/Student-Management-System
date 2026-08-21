const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Set up Multer storage in memory
const storage = multer.memoryStorage();

// File filter (optional, to ensure only images are uploaded)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// POST /api/upload/image
// Uploads a single image and returns the public URL
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Convert buffer to Base64 string
        const base64String = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${base64String}`;

        res.status(200).json({ 
            success: true, 
            message: 'Image uploaded successfully',
            url: dataUri
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error during upload' });
    }
});

module.exports = router;
