// src/App.tsx
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

  return (
    <div>
      {currentPage === "main" && (
        <div>
          <h1>Evidence schránka důvěry</h1>
          <button onClick={handleViewAlerts}>Přehled stížností</button>
          <button onClick={handleCreateAlert}>Vytvořit novou stížnost</button>
        </div>
      )}

      {currentPage === "list" && (
        <AlertList onSelect={handleSelectAlert} onBack={handleBack} />
      )}
      {currentPage === "form" && <AlertForm onBack={handleBack} />}
      {currentPage === "detail" && selectedAlertId && (
        <AlertDetail alertId={selectedAlertId} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
