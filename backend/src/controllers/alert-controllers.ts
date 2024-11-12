import dotenv from 'dotenv';
import createError from 'http-errors';

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { processFiles, cleanUpStorage } from '../middlewares/file-processor-middleware';
import {
  doesAlertInputsExist,
  validateAlertId,
  parseAge,
  validateFileIdsToDelete,
  validateFileCount,
} from '../utils/validations';
import {
  createAlertQuery,
  createFilesQuery,
  deleteAlertByIdQuery,
  deleteFilesByIdsQuery,
  fetchAlertByIdQuery,
  fetchAlertsQuery,
  updateAlertQuery,
} from '../services/alert-queries-service';

dotenv.config();

const prisma = new PrismaClient();

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[] | undefined) ?? [];

    try {
      doesAlertInputsExist(sender, age);
      const parsedAge = parseAge(age);

      const result = await prisma.$transaction(async (tx) => {
        const newAlert = await createAlertQuery(sender, parsedAge, description, filesToUpload, tx);
        return newAlert;
      });

      res.status(201).json({ message: 'Alert created successfully', result });
    } catch (error) {
      console.error('Error creating alert:', error);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
      }
    }
  });
};

export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const alertId = validateAlertId(req.params.id);
    const alert = await fetchAlertByIdQuery(alertId);
    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching alert:', error);
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  }
};

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await fetchAlertsQuery();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description, deleteFileIds = [] } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[] | undefined) ?? [];

    try {
      const alertId = validateAlertId(req.params.id);
      const parsedAge = parseAge(age);
      const parsedDeleteFileIds = validateFileIdsToDelete(deleteFileIds);
      console.log('přeparsované file ids k mazání', parsedDeleteFileIds);

      const updatedAlert = await prisma.$transaction(async (tx) => {
        const alert = await fetchAlertByIdQuery(alertId, tx);
        const deletedFilesCount = await deleteFilesByIdsQuery(parsedDeleteFileIds, alert, tx);
        validateFileCount(deletedFilesCount, filesToUpload.length, alert.files.length);

        await createFilesQuery(filesToUpload, alertId, tx);
        await updateAlertQuery(alert, sender, parsedAge, description, tx);
        return await fetchAlertByIdQuery(alert.id, tx);
      });

      res.json({ message: 'Alert updated successfully', alert: updatedAlert });
    } catch (error) {
      console.error('Error updating alerts:', error);
      cleanUpStorage(filesToUpload);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        cleanUpStorage(filesToUpload);
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Failed to update alert' });
      }
    }
  });
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alertId = validateAlertId(req.params.id);
    await deleteAlertByIdQuery(alertId);
    res.status(204).json({ message: 'Alert and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting alerts:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  }
};


/*import dotenv from 'dotenv';
import createError from 'http-errors';

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { processFiles } from '../middlewares/file-processor-middleware';
import { 
  doesAlertInputsExist, 
  validateAlertId, 
  parseAge, 
  validateFileIdsToDelete, 
  validateFileCount 
} from '../utils/validations';
import { 
  createAlertQuery, 
  createFilesQuery, 
  deleteAlertByIdQuery,
  deleteFilesByIdsQuery, 
  fetchAlertByIdQuery, 
  fetchAlertsQuery,  
  updateAlertQuery
} from '../services/alert-queries-service';

dotenv.config();

const prisma = new PrismaClient();


export const createAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[] | undefined) ?? [];
    
    try {
      doesAlertInputsExist(sender, age);
      const parsedAge = parseAge(age); 
      
      const result = await prisma.$transaction(async (tx) => {
        const newAlert = await createAlertQuery(sender, parsedAge, description, filesToUpload, tx);
        return newAlert;
      });

      res.status(201).json({ message: 'Alert created successfully', result });
    } catch (error) {
      console.error('Error creating alert:', error);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('Error creating alert:', error);
        res.status(500).json({ error: 'Failed to create alert' });
      }
    }
  });
};

export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {  
    const alertId = validateAlertId(req.params.id);
    const alert = await fetchAlertByIdQuery(alertId);
    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching alert:', error);
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  }
};

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await fetchAlertsQuery();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }
    
    const { sender, age, description, deleteFileIds = [] } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[] | undefined) ?? [];
  
    try {
      const alertId = validateAlertId(req.params.id);
      const parsedAge = parseAge(age);
      const parsedDeleteFileIds = validateFileIdsToDelete(deleteFileIds);
      
      const updatedAlert = await prisma.$transaction(async (tx) => {
        const alert = await fetchAlertByIdQuery(alertId, tx)
        const deletedFilesCount = await deleteFilesByIdsQuery(parsedDeleteFileIds, alert, tx);
        validateFileCount(deletedFilesCount, filesToUpload.length, alert.files.length);
    
        await createFilesQuery(filesToUpload, alertId, tx);
        await updateAlertQuery( alert, sender, parsedAge, description, tx);
        return await fetchAlertByIdQuery(alert.id, tx);
      });
      res.json({ message: 'Alert updated successfully', alert: updatedAlert });
    } catch (error){
      console.error('Error updating alerts:', error);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Failed to update alert' });
      }
    }
  });
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alertId = validateAlertId(req.params.id);
    await deleteAlertByIdQuery(alertId);
    res.status(204).json({ message: 'Alert and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting alerts:', error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  }
};

/*
export const createAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description } : CreateAlertBodyType = req.body;
    const parsedAge = Number(age);

    try {
    
      if (!sender || !parsedAge) {
        res.status(400).json({ error: 'Sender and age are required' });
        return;
      }
      if (isNaN(parsedAge) || parsedAge <= 0 ){
        res.status(400).json({error: 'Age must be a positive integer'})
        return;
      }

      const files = req.files as Express.Multer.File[] | undefined;
      const safeFiles = files ?? [];
        
      const alert = await prisma.$transaction(async (tx) => {
        const newAlert = await tx.alert.create({
          data: {
            sender:sender,
            age:parsedAge,
            description: description,
            userId: DEFAULT_USER_ID,
          },
        });

        const fileData = safeFiles.map((file) => ({
          path: path.join(UPLOAD_DIRECTORY, file.filename),
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          alertId: newAlert.id,
        }));

        await tx.file.createMany({ data: fileData });

        return newAlert;
      });

      res.status(201).json({ message: 'Alert created successfully', alert });
    } catch (error) {
      console.error('Error creating alert:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });
};
*/
/*
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId ? Number(req.query.userId) : DEFAULT_USER_ID; // DEFAULT_USER_ID in this showcase for simplicity
  
  try {

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ error: 'Invalid user ID' });
      return; 
    }

    const alerts = await prisma.alert.findMany({
      where: { userId },
      include: {
        files: true,
      },
    });

    if (alerts.length === 0) {
      res.status(404).json({ message: 'No alerts found for this user' });
      return;
    }

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};
*/
/*
export const getAlertById = async (req: Request, res: Response) : Promise<void> => {
  const { id } = req.params;
  const alertId = Number(id)
  const userId = req.query.userId ? Number(req.query.userId) : DEFAULT_USER_ID; // DEFAULT_USER_ID in this showcase for simplicity
  
  try {

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ error: 'Invalid user ID' });
      return; 
    }

    const alert = await prisma.alert.findUnique({
      where: {
          userId: userId, 
          id:  alertId,
      },
      include: { files: true },
    });

    if (!alert) {
      res.status(404).json({ error: "Alert not found" });
      return; 
    }

    res.json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve alert" });
  }
};
*/
/*
export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError){
      res.status(400).json({ error: processError.message });
      return;
    }  

    const { id } = req.params;
    const { sender, age, description, deleteFileIds = [] } = req.body;  
    const userId = req.query.userId ? Number(req.query.userId) : 1; // DEFAULT_USER_ID in this showcase for simplicity
    const parsedAge = Number(age);
    
    try {

      const alertId = Number(id);
      if (isNaN(alertId)) {
        res.status(400).json({ error: 'Invalid alert ID' });
        return; 
      } 

      const parsedDeleteFileIds = typeof deleteFileIds === 'string' ? JSON.parse(deleteFileIds) : deleteFileIds;
      if (!Array.isArray(parsedDeleteFileIds)) {
        res.status(400).json({ error: 'deleteFileIds must be an array' });
        return; 
      }

      const files = req.files as Express.Multer.File[] | undefined;
      const safeFiles = files ?? [];

      // Start a transaction to ensure atomicity
      const updatedAlertWithFiles = await prisma.$transaction(async (tx) => {
        // Step 1: Check if alert exists and fetch current files
        const alert = await tx.alert.findUnique({
          where: { 
            userId: userId,
            id: alertId, 
          },
          include: { files: true },
        });

        if (!alert) throw new Error('Alert not found');

        // Step 2: Delete specified files from the database and filesystem
        const existingFileIds = alert.files.map((file) => file.id);
        const validDeleteFileIds = parsedDeleteFileIds.filter((fileId) => existingFileIds.includes(fileId));
        
        if (validDeleteFileIds.length > 0) {
          const filesToDelete = alert.files.filter((file) => validDeleteFileIds.includes(file.id));
          
          await tx.file.deleteMany({ where: { id: { in: validDeleteFileIds } } });
          filesToDelete.forEach((file) => deleteFileFromFilesystem(file.path));
        }

        // Step 3: Validate new file count
        const remainingFileCount = alert.files.length - validDeleteFileIds.length;
        const newFileCount = remainingFileCount + safeFiles.length;

        if (newFileCount > 3) {
          throw new Error(`Cannot upload more than ${3} files in total, alredy at limit`);
        }

        // Step 4: Upload new files and save metadata in a single operation
        const fileData = safeFiles.map((file) => ({
          path: path.join(UPLOAD_DIRECTORY, file.filename),
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          alertId,
        }));

        if (fileData.length > 0) await tx.file.createMany({ data: fileData });

        // Step 5: Update alert core fields (sender, age, description) if provided
        const updatedAlertData = {
          sender: sender ?? alert.sender,
          age: parsedAge ?? alert.age,
          description: description ?? alert.description,
        };

        await tx.alert.update({
          where: {
            userId: userId, 
            id: alertId, 
          },
          data: updatedAlertData,
        });

        // Step 6: Fetch the updated alert with files
        return tx.alert.findUnique({
          where: { 
            userId: userId,
            id: alertId,
           },
          include: { files: true },
        });
      });

      res.json({ message: 'Alert updated successfully', alert: updatedAlertWithFiles });
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({error: `${error}`});
    }
  });
};*/

/*
export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  const alertId = Number(req.params.id);
  const userId = req.query.userId ? Number(req.query.userId) : DEFAULT_USER_ID; // DEFAULT_USER_ID in this showcase for simplicity

  if (isNaN(alertId)) {
    res.status(400).json({ error: 'Invalid alert ID' });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const alert = await tx.alert.findUnique({
        where: { id: alertId },
        include: { files: true },
      });
      
      if (!alert) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }
      
      await Promise.all(
        alert.files.map(async (file) => {
          await deleteFileFromFilesystem(file.path);
          await tx.file.delete({ where: { id: file.id } });
        })
      );
      
      await tx.alert.delete({ 
        where: { 
          userId: userId,
          id: alertId,
        } 
      });
    });

    res.json({ message: 'Alert and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert and associated files' });
  }
};
*/
