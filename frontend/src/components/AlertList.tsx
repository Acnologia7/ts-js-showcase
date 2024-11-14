/*import React, { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import { AlertListProps } from "../types/alertTypes";

const AlertList: React.FC<AlertListProps> = ({ onSelect, onBack }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || "Failed to fetch alerts";
        setError(errorMessage);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div>
      <h2>Alert list</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <li key={alert.id}>
              {alert.id} - {alert.sender}
              <button onClick={() => onSelect(alert.id)}>Details</button>
            </li>
          ))
        ) : (
          <li>No alerts found</li>
        )}
      </ul>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default AlertList;
*/

import React, { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import { Alert, AlertListProps } from "../types/alertTypes";

const AlertList: React.FC<AlertListProps> = ({ onSelect, onBack }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts();
        setAlerts(data);
      } catch (err) {
        setError("Failed to fetch alerts");
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div>
      <h2>Alert List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {alerts.length > 0
          ? alerts.map((alert) => (
              <li key={alert.id}>
                {alert.id} - {alert.sender}
                <button onClick={() => onSelect(alert.id.toString())}>
                  Details
                </button>
              </li>
            ))
          : null}
      </ul>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default AlertList;
