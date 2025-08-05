import multer from 'multer';
import sharp from 'sharp';
import path from 'path';


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});


export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {

    const processedImageBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toBuffer();


    const base64Image = `data:image/jpeg;base64,${processedImageBuffer.toString('base64')}`;
    
    req.processedImage = base64Image;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(400).json({ message: 'Image processing failed' });
  }
};

export default upload;