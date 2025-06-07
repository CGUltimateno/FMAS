const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage directory for profile pictures
const PROFILE_PICS_DIR = path.join(__dirname, '..', 'public', 'profile_pics');

// Ensure the directory exists
if (!fs.existsSync(PROFILE_PICS_DIR)) {
    fs.mkdirSync(PROFILE_PICS_DIR, { recursive: true });
}

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROFILE_PICS_DIR);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename based on timestamp, whether user is authenticated or not
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);

        // If user is authenticated, include userId in filename
        if (req.user && req.user.userId) {
            cb(null, `user_${req.user.userId}_${uniqueSuffix}${extension}`);
        } else {
            // For registration or other unauthenticated uploads
            cb(null, `temp_${uniqueSuffix}${extension}`);
        }
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

module.exports = upload;