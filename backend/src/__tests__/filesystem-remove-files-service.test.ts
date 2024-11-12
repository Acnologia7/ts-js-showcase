import fs from 'fs';

import { deleteFileFromFilesystem, deleteAlertFiles } from '../services/filesystem-remove-files-service';


jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn(), 
  },
}));


describe('deleteFileFromFilesystem', () => {
  const mockFilePath = 'testfile.txt';

  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it('should throw an error if file does not exist', async () => {
    const errorMessage = "ENOENT: no such file or directory, unlink 'D:\\VS-projects\\ts-js-showcase\\uploaded_files\\testfile.txt'";
    (fs.promises.unlink as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(deleteFileFromFilesystem(mockFilePath)).rejects.toThrow(errorMessage);
  });

  it('should throw an error if given an invalid path', async () => {
    const invalidPath = '../../invalidpath'; 
    const errorMessage = "ENOENT: no such file or directory, unlink 'D:\\VS-projects\\ts-js-showcase\\uploaded_files\\invalidpath'";

    (fs.promises.unlink as jest.Mock).mockRejectedValue(new Error(errorMessage)); 

    await expect(deleteFileFromFilesystem(invalidPath)).rejects.toThrow(errorMessage);
  });
});

