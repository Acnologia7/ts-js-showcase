import fs from 'fs/promises';
import path from 'path'

const UPLOAD_DIRECTORY = path.resolve(__dirname, '../../../uploaded_files');

export const deleteFileFromFilesystem = async (filePath: string): Promise<void> => {
  try {
    const absolutePath = path.join(UPLOAD_DIRECTORY, path.basename(filePath));
    await fs.unlink(absolutePath);
  } catch (error) {
    console.error('Error deleting file from filesystem:', error);
    throw error;
  }
};

export const deleteAlertFiles = async (files: { path: string }[]): Promise<void> => {
  try {
    await Promise.all(
      files.map(async (file) => {
        await deleteFileFromFilesystem(file.path);
      })
    );
  } catch (error) {
    throw error;
  }
};
