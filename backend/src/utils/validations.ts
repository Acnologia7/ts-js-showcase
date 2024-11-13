import createError from "http-errors";
import dotenv from "dotenv";
import { ParamsDictionary } from "express-serve-static-core";

dotenv.config();

const MAX_FILES_ALLOWED = Number(process.env.MAX_FILES_ALLOWED);

export const doesAlertInputsExist = (
  sender: string | undefined,
  age: string | undefined
): void => {
  if (!sender || !age) {
    throw createError(400, "Sender and age are required");
  }
};

export const validateAlertId = (alertId: ParamsDictionary[string]): number => {
  const parsedAlertId = Number(alertId);
  if (!Number.isInteger(parsedAlertId) || parsedAlertId <= 0) {
    throw createError(400, "Invalid alert ID");
  }
  return parsedAlertId;
};

export const validateFileIdsToDelete = (deleteFileIds: string): number[] => {
  const d = JSON.parse(deleteFileIds);
  if (!Array.isArray(d)) {
    throw createError(400, "deleteFileIds must be an array");
  }

  const parsedFileIds = d.map((id) => {
    const num = Number(id);

    if (!id || isNaN(num) || !Number.isInteger(num) || num <= 0) {
      throw createError(
        400,
        `Invalid file ID: "${id}" is not a positive integer`
      );
    }

    return num;
  });

  return parsedFileIds;
};

export const validateFileCount = (
  deleteFileIds: number,
  newFilesCount: number,
  existingFileCount: number
) => {
  const remainingFileCount = existingFileCount - deleteFileIds;
  const newFileCount = remainingFileCount + newFilesCount;
  if (newFileCount > MAX_FILES_ALLOWED) {
    throw createError(
      400,
      `Cannot upload more than ${MAX_FILES_ALLOWED} files in total, already at limit`
    );
  }
};

export const parseAge = (age: string | undefined): number => {
  const parsedAge = Number(age);
  if (isNaN(parsedAge) || parsedAge <= 0) {
    throw createError(400, "Age must be a positive integer");
  }
  return parsedAge;
};
