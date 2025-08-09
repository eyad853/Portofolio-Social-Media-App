import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";

// Define base upload directory
// __dirname replacement in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadDir = path.join(__dirname, "..", "uploads", "profile");

// Ensure the subdirectories exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = '';

    if (file.fieldname === 'coverPhoto') {
      subDir = 'coverPhotos';
    } else if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    }else if (file.fieldname === 'story') {
      subDir = 'stories';
    }else {
      return cb(new Error('Invalid fieldname for upload'));
    }

    const uploadPath = path.join(baseUploadDir, subDir);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// This handles both fields
const uploadProfileImages = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
  { name: "story", maxCount: 1 } // ✅ Add this
]);

export default uploadProfileImages;