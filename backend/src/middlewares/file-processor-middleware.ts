import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import dotenv from "dotenv";
import createError from "http-errors";
import fs from "fs/promises";

dotenv.config();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_COUNT = 3;

const ALLOWED_MIME_TYPES =
  process.env.ALLOWED_MIME_TYPES || "application/pdf".split(", ");

const UPLOAD_DIRECTORY = path.join(
  __dirname,
  process.env.UPLOAD_DIRECTORY || "../../../uploaded_files"
);

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const normalizedMimeType = file.mimetype.toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(normalizedMimeType)) {
    cb(null, true);
  } else {
    cb(
      createError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types are: ${ALLOWED_MIME_TYPES}`
      )
    );
  }
};

export const processFiles = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILE_COUNT,
  },
  fileFilter,
}).array("files", MAX_FILE_COUNT);

// Cleanup function if necessary
export const cleanUpStorage = async (filesToCleanUp: Express.Multer.File[]) => {
  if (filesToCleanUp && Array.isArray(filesToCleanUp)) {
    try {
      await Promise.all(filesToCleanUp.map((file) => fs.unlink(file.path)));
      console.log("Cleaned up uploaded files due to error in custom logic");
    } catch (cleanupErr) {
      console.error("Error during file cleanup:", cleanupErr);
    }
  }
};
