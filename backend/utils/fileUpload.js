const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating upload directory: ${uploadDir}`);
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Upload directory created successfully');
  } catch (err) {
    console.error('Error creating upload directory:', err);
    throw err;
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  console.log('Processing file upload:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    console.log('File accepted:', file.originalname);
    return cb(null, true);
  } else {
    const error = new Error(`File type not allowed: ${file.originalname}. Only images are allowed (jpeg, jpg, png, gif).`);
    console.error('File rejected:', error.message);
    return cb(error, false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
}).single('image');

module.exports = upload;
