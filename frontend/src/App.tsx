import React, { useState } from "react";
import AlertList from "./components/AlertList";
import AlertForm from "./components/AlertForm";
import AlertDetail from "./components/AlertDetail";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<
    "main" | "list" | "form" | "detail"
  >("main");

  const [selectedAlertId, setSelectedAlertId] = useState<string | undefined>(
    undefined
  );

  const handleSelectAlert = (id: string) => {
    setSelectedAlertId(id);
    setCurrentPage("detail");
  };

  const handleCreateAlert = () => {
    setCurrentPage("form");
  };

  const handleViewAlerts = () => {
    setCurrentPage("list");
  };

  const handleBack = () => {
    setCurrentPage("main");
    setSelectedAlertId(undefined);
  };

  const handleBackToList = () => {
    setCurrentPage("list");
  };

  const handleOnDeleteBack = () => {
    setCurrentPage("list");
  };

  return (
    <div>
      {currentPage === "main" && (
        <div>
          <h1>Alert Evidence</h1>
          <button onClick={handleViewAlerts}>View Alert</button>{" "}
          <button onClick={handleCreateAlert}>Create New Alert</button>{" "}
        </div>
      )}

      {currentPage === "list" && (
        <AlertList onSelect={handleSelectAlert} onBack={handleBack} />
      )}

      {currentPage === "form" && <AlertForm onBack={handleBack} />}

      {currentPage === "detail" && selectedAlertId && (
        <AlertDetail
          alertId={selectedAlertId}
          onBack={handleBackToList}
          onDeleteBack={handleOnDeleteBack}
        />
      )}
    </div>
  );
};

export default App;
