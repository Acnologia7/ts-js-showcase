import React, { useEffect, useState } from "react";
import { getAlertById, updateAlert, deleteAlert } from "../services/api";

interface AlertDetailProps {
  alertId: string;
  onBack: () => void;
}

const AlertDetail: React.FC<AlertDetailProps> = ({ alertId, onBack }) => {
  const [alert, setAlert] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        const data = await getAlertById(alertId);
        setAlert(data);
      } catch (err) {
        setError("Failed to fetch alert details");
      }
    };
    fetchAlertDetails();
  }, [alertId]);

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
      onBack();
    } catch (err) {
      setError("Failed to delete alert");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("sender", alert.sender);
    formData.append("age", alert.age);
    formData.append("description", alert.description);

    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("deleteFileIds", JSON.stringify(deleteFileIds));

    try {
      await updateAlert(alertId, formData);
      onBack();
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
            {alert.files?.map((file: any) => (
              <li key={file.id}>
                {file.originalName}{" "}
                <label>
                  <input
                    type="checkbox"
                    checked={deleteFileIds.includes(file.id)} // If file ID is in deleteFileIds, check the checkbox
                    onChange={() => handleFileDeleteChange(file.id)}
                  />
                  Delete file
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label>Upload New Files:</label>
          <input type="file" multiple onChange={handleFileChange} />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

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
