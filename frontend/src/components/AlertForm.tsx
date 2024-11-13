import React, { useState } from "react";
import { createAlert } from "../services/api";

interface AlertFormProps {
  onBack: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({ onBack }) => {
  const [sender, setSender] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("sender", sender);
    formData.append("age", String(age));
    formData.append("description", description);
    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      await createAlert(formData);
      onBack();
    } catch (err) {
      setError("Failed to create alert");
    }
  };

  return (
    <div>
      <h2>Create New Alert</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Sender:</label>
          <input value={sender} onChange={(e) => setSender(e.target.value)} />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Files:</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Create Alert</button>
      </form>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default AlertForm;
