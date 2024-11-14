import { AlertItemProps } from "../types/alertTypes";

const AlertItem: React.FC<AlertItemProps> = ({ alert, onSelect }) => (
  <li>
    <h3>{alert.sender}</h3>
    <p>{alert.description}</p>
    <button onClick={() => onSelect(alert.id)}>View Details</button>
  </li>
);

export default AlertItem;
