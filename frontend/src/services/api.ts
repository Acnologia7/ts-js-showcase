import axios from "axios";
import { Alert } from "../types/alertTypes";

const API_URL = process.env.REACT_APP_API_URL;

export const getAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await axios.get(`${API_URL}/alerts`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch alerts");
  }
};

export const createAlert = async (alertData: FormData): Promise<Alert> => {
  try {
    const response = await axios.post(`${API_URL}/alerts`, alertData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create alert");
  }
};

export const getAlertById = async (alertId: string): Promise<Alert> => {
  try {
    const response = await axios.get(`${API_URL}/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch alert details");
  }
};

export const updateAlert = async (
  alertId: string,
  alertData: FormData
): Promise<Alert> => {
  try {
    const response = await axios.put(
      `${API_URL}/alerts/${alertId}`,
      alertData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update alert");
  }
};

export const deleteAlert = async (alertId: string): Promise<void> => {
  try {
    const response = await axios.delete(`${API_URL}/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete alert");
  }
};
