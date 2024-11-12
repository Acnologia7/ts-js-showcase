import createError from 'http-errors';
import path from 'path';
import dotenv from 'dotenv';

import { PrismaClient, Prisma } from '@prisma/client';
import { AlertsType, AlertType, FilesType } from '../types';
import { deleteAlertFiles } from './filesystem-remove-files-service';

dotenv.config();

const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID);
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || '../../../uploaded_files';

const prisma = new PrismaClient();

const getPrismaInstance = (tx?: Prisma.TransactionClient) => tx ?? prisma;

const prepareFilesMetadata = (files: Express.Multer.File[], alertId: number): FilesType => {
  const fileData = files.map((file) => ({
    path: path.join(UPLOAD_DIRECTORY, file.filename),
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    alertId: alertId,
  }));

  return fileData;
};

export const fetchAlertsQuery = async (
  tx?: Prisma.TransactionClient,
  userId: number = DEFAULT_USER_ID
): Promise<AlertsType> => {
  try {
    const prismaInstance = getPrismaInstance(tx);
    const alerts = await prismaInstance.alert.findMany({
      where: { userId },
      include: { files: true },
    });

    if (alerts.length === 0) {
      throw createError(404, 'No alerts found for this user');
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const fetchAlertByIdQuery = async (
  alertId: number,
  tx?: Prisma.TransactionClient,
  userId: number = DEFAULT_USER_ID
): Promise<AlertType> => {
  try {
    const prismaInstance = getPrismaInstance(tx);

    const alert = await prismaInstance.alert.findUnique({
      where: { userId, id: alertId },
      include: { files: true },
    });

    if (!alert) {
      throw createError(404, 'Alert not found');
    }

    return alert;
  } catch (error) {
    console.error('Error fetching alert by ID:', error);
    throw error;
  }
};

export const deleteAlertByIdQuery = async (
  alertId: number,
  userId: number = DEFAULT_USER_ID,
  tx?: Prisma.TransactionClient
): Promise<void> => {
  const prismaInstance = getPrismaInstance(tx);

  try {
    const alert = await prismaInstance.alert.findUnique({
      where: { userId, id: alertId },
      include: { files: true },
    });

    if (!alert) {
      throw createError(404, 'Alert not found');
    }

    await prismaInstance.alert.delete({
      where: { userId, id: alertId },
    });
    await deleteAlertFiles(alert.files);
  } catch (error) {
    console.error('Error in deleteAlertByIdQuery:', error);
    throw error;
  }
};

export const deleteFilesByIdsQuery = async (
  fileIds: number[],
  alert: AlertType,
  tx?: Prisma.TransactionClient
): Promise<number> => {
  try {
    const prismaInstance = getPrismaInstance(tx);

    const deletedFiles = await prismaInstance.file.deleteMany({
      where: {
        alertId: alert.id,
        id: { in: fileIds },
      },
    });

    const filesToDelete = alert.files.filter((file) => fileIds.includes(file.id));
    
    await deleteAlertFiles(filesToDelete);

    return deletedFiles.count;
  } catch (error) {
    console.error('Error deleting files from database:', error);
    throw error;
  }
};

export const createAlertQuery = async (
  sender: string,
  age: number,
  description: string,
  files: Express.Multer.File[],
  tx?: Prisma.TransactionClient,
  userId: number = DEFAULT_USER_ID
): Promise<AlertType> => {
  const prismaInstance = getPrismaInstance(tx);

  try {
    const newAlert = await prismaInstance.alert.create({
      data: {
        sender: sender,
        age: age,
        description: description,
        userId: userId,
      },
      include: {
        files: true,
      },
    });

    const preparedFileMetadata = prepareFilesMetadata(files, newAlert.id);
    await prismaInstance.file.createMany({ data: preparedFileMetadata });
    return newAlert;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const createFilesQuery = async (
  files: Express.Multer.File[],
  alertId: number,
  tx?: Prisma.TransactionClient
) => {
  const prismaInstance = getPrismaInstance(tx);
  try {
    const preparedFilesMetadata = prepareFilesMetadata(files, alertId);
    await prismaInstance.file.createMany({ data: preparedFilesMetadata });
  } catch (error) {
    console.error('Error creating files for alert:', error);
    throw error;
  }
};

export const updateAlertQuery = async (
  ogAlert: AlertType,
  sender?: string,
  age?: number,
  description?: string,
  tx?: Prisma.TransactionClient
) => {
  const prismaInstance = getPrismaInstance(tx);
  const updatedAlertData = {
    sender: sender ?? ogAlert.sender,
    age: age ?? ogAlert.age,
    description: description ?? ogAlert.description,
  };

  try {
    await prismaInstance.alert.update({
      where: {
        userId: ogAlert.userId,
        id: ogAlert.id,
      },
      data: updatedAlertData,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};


/*import createError from 'http-errors';
import path from 'path';
import dotenv from 'dotenv'

import { PrismaClient, Prisma } from '@prisma/client';
import { AlertsType, AlertType, FilesType } from '../types';
import { deleteAlertFiles } from './filesystem-remove-files-service';
import { error } from 'console';


dotenv.config()

const DEFAULT_USER_ID = Number(process.env.DEFAULT_USER_ID);
const UPLOAD_DIRECTORY = process.env.UPLOAD_DIRECTORY || '../../../uploaded_files';

const prisma = new PrismaClient();

const getPrismaInstance = (tx?: Prisma.TransactionClient) => tx ?? prisma;


const prepareFilesMetadata = (files:Express.Multer.File[], alertId: number) : FilesType => {
  const fileData = files.map((file) => ({
    path: path.join(UPLOAD_DIRECTORY, file.filename),
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    alertId: alertId,
  }));

  return fileData;
};



export const fetchAlertsQuery = async (tx?: Prisma.TransactionClient, userId: number = DEFAULT_USER_ID): Promise<AlertsType> => {
  try {
    const prismaInstance = getPrismaInstance(tx);
    const alerts = await prismaInstance.alert.findMany({
      where: { userId },
      include: { files: true },
    });

    if (alerts.length === 0) {
      throw createError(404, 'No alerts found for this user');
    }

    return alerts;

  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};



export const fetchAlertByIdQuery = async (
  alertId: number, 
  tx?: Prisma.TransactionClient, 
  userId: number = DEFAULT_USER_ID
): Promise<AlertType> => {
  try {
    const prismaInstance = getPrismaInstance(tx);
    
    const alert = await prismaInstance.alert.findUnique({
      where: { userId, id: alertId },
      include: { files: true },
    });

    if (!alert) {
      throw createError(404, 'Alert not found');
    }

    return alert;

  } catch (error) {
    console.error('Error fetching alert by ID:', error);
    throw error;
  }
};



export const deleteAlertByIdQuery = async (
  alertId: number, 
  userId: number = DEFAULT_USER_ID, 
  tx?: Prisma.TransactionClient
): Promise<void> => {
  const prismaInstance = getPrismaInstance(tx);

  try {
    const alert = await prismaInstance.alert.findUnique({
      where: { userId, id: alertId },
      include: { files: true },
    });

    if (!alert) {
      throw createError(404, 'Alert not found');
    }

    await deleteAlertFiles(alert.files);
    await prismaInstance.alert.delete({
      where: { userId, id: alertId },
    });
    
  } catch (error) {
    console.error('Error in deleteAlertByIdQuery:', error);
    throw error;
  }
};




  export const deleteFilesByIdsQuery = async (
    fileIds: number[], 
    alert: AlertType, 
    tx?: Prisma.TransactionClient
  ): Promise<number> =>  {
    try {
      const prismaInstance = getPrismaInstance(tx);
  
      const deletedFiles = await prismaInstance.file.deleteMany({
        where: {
          alertId: alert.id,
          id: { in: fileIds },
        },
      });
  
      return deletedFiles.count;
  
    } catch (error) {
      console.error('Error deleting files from database:', error);
      throw error;
    }
  };

export const createAlertQuery = async (
  sender: string,
  age: number,
  description: string,
  files: Express.Multer.File[],
  tx?: Prisma.TransactionClient,
  userId: number = DEFAULT_USER_ID
): Promise<AlertType> => {
  const prismaInstance = getPrismaInstance(tx);

  try {
    const newAlert = await prismaInstance.alert.create({
      data: {
        sender: sender,
        age: age,
        description: description,
        userId: userId,
      },
      include: {
        files: true,
      },
    });

    const preparedFileMetadata = prepareFilesMetadata(files, newAlert.id);
    await prismaInstance.file.createMany({ data: preparedFileMetadata });
    return newAlert;

  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const createFilesQuery = async (
  files: Express.Multer.File[],  
  alertId: number, tx?: Prisma.TransactionClient
) => {
  const prismaInstance = getPrismaInstance(tx);
  try {
    const preparedFilesMetadata = prepareFilesMetadata(files, alertId);
    await prismaInstance.file.createMany({data: preparedFilesMetadata})
  } catch (error) {
      console.error('Error creating files for alert:', error);
      throw error;
  }
};

export const updateAlertQuery = async(
  ogAlert: AlertType, 
  sender?: string, 
  age?: number, 
  description?: string, 
  tx?: Prisma.TransactionClient
) => {
  const prismaInstance = getPrismaInstance(tx);
  const updatedAlertData = {
    sender: sender ?? ogAlert.sender,
    age: age ?? ogAlert.age,
    description: description ?? ogAlert.description,
  };

  try {
    await prismaInstance.alert.update({
      where: {
        userId: ogAlert.userId, 
        id: ogAlert.id, 
      },
      data: updatedAlertData,
    });
  }catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};


/*export const fetchAlertsQuery = async (tx?: Prisma.TransactionClient, userId: number = DEFAULT_USER_ID): Promise<AlertsType> => {
  const prismaInstance = getPrismaInstance(tx);
  const alerts = await prismaInstance.alert.findMany({
    where: { userId },
    include: { files: true },
  });

  if (alerts.length === 0) {
    throw createError(404, 'No alerts found for this user');
  }

  return alerts;
};*/
/*
export const fetchAlertByIdQuery = async (alertId: number, tx?: Prisma.TransactionClient, userId: number=DEFAULT_USER_ID ,): Promise<AlertType> => {
  const prismaInstance = getPrismaInstance(tx);
  
  const alert = await prismaInstance.alert.findUnique({
    where: { userId, id: alertId },
    include: { files: true },
  });

  if (!alert) {
    throw createError(404, 'Alert not found');
  }

  return alert;
};*/
/*export const deleteAlertByIdQuery = async (alertId: number, userId: number=DEFAULT_USER_ID, tx?: Prisma.TransactionClient): Promise<void> => {
  const prismaInstance = getPrismaInstance(tx);
  
  const alert = await prismaInstance.alert.findUnique({
    where: { 
        userId: userId, 
        id: alertId 
    },
    include: { files: true },
    });

    if (!alert) {
      throw createError(404, 'Alert not found');
    }

    await deleteAlertFiles(alert.files);

    await prismaInstance.alert.delete({
        where: { 
            userId: userId, 
            id: alertId 
        },
    });
};*/
/*export const deleteFilesByIdsQuery = async (fileIds: number[], alert: AlertType, tx?: Prisma.TransactionClient) : Promise<number> =>  {
    const prismaInstance = getPrismaInstance(tx);
    try {
      const deletedFiles = await prismaInstance.file.deleteMany({
        where: {
            alertId: alert.id,
            id: {
                in: fileIds,
            },
        },
      });
      return deletedFiles.count;
    } catch (error) {
      console.error('Error deleting files from database:', error);
      throw createError(500, 'Failed to delete files from database');
    }
  };*/  
/*
export const createAlertQuery = async (
  sender: string,
  age: number,
  description: string,
  files: Express.Multer.File[],
  tx?: Prisma.TransactionClient,
  userId: number = DEFAULT_USER_ID
) => {
    const prismaInstance = getPrismaInstance(tx);
    const newAlert = await prismaInstance.alert.create({
        data: {
            sender: sender,
            age: age,
            description: description,
            userId: userId,
      
        }
    });

    const preparedFileMetadata = prepareFilesMetadata(files, newAlert.id);

    await prismaInstance.file.createMany({ data: preparedFileMetadata });

    return newAlert;
};*/
