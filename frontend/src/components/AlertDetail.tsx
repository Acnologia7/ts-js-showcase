import React, { useCallback, useEffect, useState } from "react";
import { getAlertById, updateAlert, deleteAlert } from "../services/api";
import { Alert, AlertDetailProps, AlertFile } from "../types/alertTypes";

const AlertDetail: React.FC<AlertDetailProps> = ({
  alertId,
  onBack,
  onDeleteBack,
}) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  const fetchAlertDetails = useCallback(async () => {
    try {
      const data = await getAlertById(alertId);
      setAlert(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch alert details");
    }
  }, [alertId]);

  useEffect(() => {
    fetchAlertDetails();
  }, [fetchAlertDetails]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  };

  const handleFileDeleteChange = (fileId: string) => {
    setDeleteFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDelete = async () => {
    try {
      await deleteAlert(alertId);
      onDeleteBack();
    } catch (err) {
      setError("Failed to delete alert");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alert) {
      setError("Alert data is missing");
      return;
    }

    const formData = new FormData();
    formData.append("sender", alert.sender);
    formData.append("age", String(alert.age));
    formData.append("description", alert.description);

    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("deleteFileIds", JSON.stringify(deleteFileIds));

    try {
      await updateAlert(alertId, formData);
      setSuccessMessage("Alert updated successfully!");
      setError(null);

      await fetchAlertDetails();
      setFilesToUpload([]);
      setDeleteFileIds([]);
      setFileInputKey((prevKey) => prevKey + 1);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update alert");
    }
  };

  if (alert === null) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Alert Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Sender:</label>
          <input
            type="text"
            value={alert.sender}
            onChange={(e) => setAlert({ ...alert, sender: e.target.value })}
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={alert.age}
            onChange={(e) =>
              setAlert({ ...alert, age: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={alert.description}
            onChange={(e) =>
              setAlert({ ...alert, description: e.target.value })
            }
          />
        </div>

        <div>
          <h3>Uploaded Files</h3>
          <ul>
            {alert.files?.map((file: AlertFile) => (
              <li key={file.id}>
                {file.originalName}{" "}
                <label>
                  <input
                    type="checkbox"
                    checked={deleteFileIds.includes(file.id.toString())}
                    onChange={() => handleFileDeleteChange(file.id.toString())}
                  />
                  Delete file
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label>Upload New Files:</label>
          <input
            key={fileInputKey}
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <button type="submit">Update Alert</button>
      </form>

      <button onClick={onBack}>Back</button>
      <button onClick={handleDelete} style={{ color: "red" }}>
        Delete Alert
      </button>
    </div>
  );
};

export default AlertDetail;
