import dotenv from "dotenv";
import createError from "http-errors";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  processFiles,
  cleanUpStorage,
} from "../middlewares/file-processor-middleware";
import {
  doesAlertInputsExist,
  validateAlertId,
  parseAge,
  validateFileIdsToDelete,
  validateFileCount,
} from "../utils/validations";
import {
  createAlertQuery,
  createFilesQuery,
  deleteAlertByIdQuery,
  deleteFilesByIdsQuery,
  fetchAlertByIdQuery,
  fetchAlertsQuery,
  updateAlertQuery,
} from "../services/alert-queries-service";
import { CreateAlertRequestBody, UpdateAlertRequestBody } from "../types";

dotenv.config();

const prisma = new PrismaClient();

export const createAlert = async (
  req: Request<{}, {}, CreateAlertRequestBody>,
  res: Response
): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[]) ?? [];

    try {
      doesAlertInputsExist(sender, age);
      const parsedAge = parseAge(age);

      const result = await prisma.$transaction(async (tx) => {
        const newAlert = await createAlertQuery(
          sender,
          parsedAge,
          filesToUpload,
          description,
          tx
        );
        return newAlert;
      });

      res.status(201).json({ message: "Alert created successfully", result });
    } catch (error) {
      console.error("Error creating alert:", error);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error("Error creating alert:", error);
        res.status(500).json({ error: "Failed to create alert" });
      }
    }
  });
};

export const getAlertById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const alertId = validateAlertId(req.params.id);
    const alert = await fetchAlertByIdQuery(alertId);
    res.json(alert);
  } catch (error) {
    console.error("Error fetching alert:", error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error("Error fetching alert:", error);
      res.status(500).json({ error: "Failed to fetch alert" });
    }
  }
};

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await fetchAlertsQuery();
    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  }
};

export const updateAlert = async (
  req: Request<{ id: string }, {}, UpdateAlertRequestBody>,
  res: Response
): Promise<void> => {
  processFiles(req, res, async (processError) => {
    if (processError) {
      res.status(400).json({ error: processError.message });
      return;
    }

    const { sender, age, description, deleteFileIds } = req.body;
    const filesToUpload = (req.files as Express.Multer.File[]) ?? [];

    try {
      const alertId = validateAlertId(req.params.id);
      const parsedAge = parseAge(age);
      const parsedDeleteFileIds = validateFileIdsToDelete(deleteFileIds);

      const updatedAlert = await prisma.$transaction(async (tx) => {
        const alert = await fetchAlertByIdQuery(alertId, tx);
        const deletedFilesCount = await deleteFilesByIdsQuery(
          parsedDeleteFileIds,
          alert,
          tx
        );
        validateFileCount(
          deletedFilesCount,
          filesToUpload.length,
          alert.files.length
        );

        await createFilesQuery(filesToUpload, alertId, tx);
        await updateAlertQuery(alert, sender, parsedAge, description, tx);
        return await fetchAlertByIdQuery(alert.id, tx);
      });

      res.json({ message: "Alert updated successfully", alert: updatedAlert });
    } catch (error) {
      console.error("Error updating alerts:", error);
      cleanUpStorage(filesToUpload);
      if (createError.isHttpError(error)) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        cleanUpStorage(filesToUpload);
        console.error("Error updating alert:", error);
        res.status(500).json({ error: "Failed to update alert" });
      }
    }
  });
};

export const deleteAlert = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const alertId = validateAlertId(req.params.id);
    await deleteAlertByIdQuery(alertId);
    res
      .status(204)
      .json({ message: "Alert and associated files deleted successfully" });
  } catch (error) {
    console.error("Error deleting alerts:", error);
    if (createError.isHttpError(error)) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error("Error deleting alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  }
};
