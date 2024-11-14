import {
  doesAlertInputsExist,
  validateAlertId,
  validateFileIdsToDelete,
  validateFileCount,
  parseAge,
} from "../utils/validations";
import createError from "http-errors";

describe("doesAlertInputsExist", () => {
  it("should not throw an error when both sender and age are provided", () => {
    expect(() => doesAlertInputsExist("testSender", "25")).not.toThrow();
  });

  it("should throw an error if sender is missing", () => {
    expect(() => doesAlertInputsExist(undefined, "25")).toThrow(
      createError(400, "Sender and age are required")
    );
  });

  it("should throw an error if age is missing", () => {
    expect(() => doesAlertInputsExist("testSender", undefined)).toThrow(
      createError(400, "Sender and age are required")
    );
  });

  it("should throw an error if both sender and age are missing", () => {
    expect(() => doesAlertInputsExist(undefined, undefined)).toThrow(
      createError(400, "Sender and age are required")
    );
  });
});

describe("validateAlertId", () => {
  it("should return a valid alert ID when given a positive integer as a string", () => {
    expect(validateAlertId("5")).toBe(5);
  });

  it("should throw an error if alertId is not a valid integer", () => {
    expect(() => validateAlertId("abc")).toThrow(
      createError(400, "Invalid alert ID")
    );
  });

  it("should throw an error if alertId is zero", () => {
    expect(() => validateAlertId("0")).toThrow(
      createError(400, "Invalid alert ID")
    );
  });

  it("should throw an error if alertId is a negative number", () => {
    expect(() => validateAlertId("-10")).toThrow(
      createError(400, "Invalid alert ID")
    );
  });

  it("should throw an error if alertId is a decimal number", () => {
    expect(() => validateAlertId("3.14")).toThrow(
      createError(400, "Invalid alert ID")
    );
  });

  it("should throw an error if alertId is undefined", () => {
    expect(() => validateAlertId(undefined as any)).toThrow(
      createError(400, "Invalid alert ID")
    );
  });
});

describe("validateFileIdsToDelete", () => {
  it("should return an array of numbers when given an array of numeric strings", () => {
    expect(validateFileIdsToDelete(JSON.stringify(["1", "2", "3"]))).toEqual([
      1, 2, 3,
    ]);
  });

  it("should throw an error if deleteFileIds is not an array", () => {
    expect(() =>
      validateFileIdsToDelete(JSON.stringify("not-an-array"))
    ).toThrow(createError(400, "deleteFileIds must be an array"));
  });

  it("should throw an error if any element in deleteFileIds is not a number", () => {
    expect(() =>
      validateFileIdsToDelete(JSON.stringify(["1", "two", "3"]))
    ).toThrow(
      createError(400, 'Invalid file ID: "two" is not a positive integer')
    );
  });

  it("should handle empty arrays without throwing an error", () => {
    expect(validateFileIdsToDelete("[]")).toEqual([]);
  });

  it("should throw an error if an element is a valid string but not a numeric string", () => {
    expect(() =>
      validateFileIdsToDelete(JSON.stringify(["1", "", "3"]))
    ).toThrow(
      createError(400, 'Invalid file ID: "" is not a positive integer')
    );
  });

  it("should throw an error if any element is a decimal or non-integer", () => {
    expect(() =>
      validateFileIdsToDelete(JSON.stringify(["1", "2.5", "3"]))
    ).toThrow(
      createError(400, 'Invalid file ID: "2.5" is not a positive integer')
    );
  });

  it("should throw an error if an element is null", () => {
    expect(() =>
      validateFileIdsToDelete(JSON.stringify(["1", undefined as any, "3"]))
    ).toThrow(
      createError(400, 'Invalid file ID: "null" is not a positive integer')
    );
  });
});

const MAX_FILES_ALLOWED = 3;

describe("validateFileCount", () => {
  it("should not throw an error if the total file count is within the limit", () => {
    expect(() => validateFileCount(1, 1, 2)).not.toThrow();
  });

  it("should throw an error if the total file count exceeds MAX_FILES_ALLOWED", () => {
    expect(() => validateFileCount(1, 3, 2)).toThrow(
      createError(
        400,
        `Cannot upload more than ${MAX_FILES_ALLOWED} files in total, already at limit`
      )
    );
  });

  it("should not throw an error if the total file count equals MAX_FILES_ALLOWED", () => {
    expect(() => validateFileCount(1, 2, 2)).not.toThrow();
  });

  it("should throw an error if trying to add files when existing files are already at the limit", () => {
    expect(() => validateFileCount(0, 1, MAX_FILES_ALLOWED)).toThrow(
      createError(
        400,
        `Cannot upload more than ${MAX_FILES_ALLOWED} files in total, already at limit`
      )
    );
  });

  it("should handle cases where deleteFileIds and newFilesCount both equal zero (no changes)", () => {
    expect(() => validateFileCount(0, 0, 2)).not.toThrow();
  });

  it("should handle cases where deleteFileIds exceeds existingFileCount", () => {
    expect(() => validateFileCount(3, 1, 2)).not.toThrow();
  });

  it("should throw an error if the initial existingFileCount already exceeds the limit", () => {
    expect(() => validateFileCount(0, 0, MAX_FILES_ALLOWED + 1)).toThrow(
      createError(
        400,
        `Cannot upload more than ${MAX_FILES_ALLOWED} files in total, already at limit`
      )
    );
  });
});

describe("parseAge", () => {
  it("should return a positive integer when a valid numeric string is provided", () => {
    expect(parseAge("25")).toBe(25);
  });

  it("should throw an error if age is not a number", () => {
    expect(() => parseAge("twenty")).toThrow(
      createError(400, "Age must be a positive integer")
    );
  });

  it("should throw an error if age is a negative number", () => {
    expect(() => parseAge("-5")).toThrow(
      createError(400, "Age must be a positive integer")
    );
  });

  it("should throw an error if age is zero", () => {
    expect(() => parseAge("0")).toThrow(
      createError(400, "Age must be a positive integer")
    );
  });

  it("should throw an error if age is undefined", () => {
    expect(() => parseAge(undefined)).toThrow(
      createError(400, "Age must be a positive integer")
    );
  });

  it("should throw an error if age is an empty string", () => {
    expect(() => parseAge("")).toThrow(
      createError(400, "Age must be a positive integer")
    );
  });

  it("should handle valid string representations of large integers", () => {
    expect(parseAge("100")).toBe(100);
  });
});
