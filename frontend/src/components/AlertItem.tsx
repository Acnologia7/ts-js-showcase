const AlertItem = ({
  alert,
  onSelect,
}: {
  alert: any;
  onSelect: (id: string) => void;
}) => (
  <li>
    <h3>{alert.sender}</h3>
    <p>{alert.description}</p>
    <button onClick={() => onSelect(alert.id)}>View Details</button>
  </li>
);

export default AlertItem;
