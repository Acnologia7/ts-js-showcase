import path from 'path';
import { prepareFilesMetadata } from '../services/alert-queries-service';
import { Readable } from 'stream';


const mockFiles: Express.Multer.File[] = [
  {
    fieldname: 'file1',
    originalname: 'file1.pdf',
    filename: 'file1-12345.pdf',
    size: 1000,
    mimetype: 'application/pdf',
    encoding: '7bit',
    stream: new Readable,
    destination: '/mock/path',
    path: '..\\..\\..\\uploaded_files\\file1-12345.pdf',
    buffer: Buffer.from([]),
  },
  {
    fieldname: 'file2',
    originalname: 'file2.png',
    filename: 'file2-67890.png',
    size: 1500,
    mimetype: 'image/png',
    encoding: '7bit',
    stream: new Readable,
    destination: '/mock/path',
    path: '..\\..\\..\\uploaded_files\\file2-67890.png',
    buffer: Buffer.from([]), 
  },
];

const UPLOAD_DIRECTORY = '..\\..\\..\\uploaded_files';

describe('prepareFilesMetadata', () => {
  const alertId = 1;

  it('should return an array of file metadata', () => {
    const result = prepareFilesMetadata(mockFiles, alertId);

    const expectedMetadata = mockFiles.map((file) => ({
      path: path.join(UPLOAD_DIRECTORY, file.filename),
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      alertId: alertId,
    }));

    expect(result).toEqual(expectedMetadata);
  });

  it('should handle an empty files array without error', () => {
    const result = prepareFilesMetadata([], alertId);

    expect(result).toEqual([]);
  });

  it('should correctly process multiple files with different properties', () => {
    const result = prepareFilesMetadata(mockFiles, alertId);

    expect(result[0]).toEqual({
      path: path.join(UPLOAD_DIRECTORY, 'file1-12345.pdf'),
      originalName: 'file1.pdf',
      size: 1000,
      mimeType: 'application/pdf',
      alertId: alertId,
    });

    expect(result[1]).toEqual({
      path: path.join(UPLOAD_DIRECTORY, 'file2-67890.png'),
      originalName: 'file2.png',
      size: 1500,
      mimeType: 'image/png',
      alertId: alertId,
    });
  });
});


