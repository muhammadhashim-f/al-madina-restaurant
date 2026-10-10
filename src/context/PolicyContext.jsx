import React, { createContext, useContext, useState } from "react";
import PolicyModal from "../components/PolicyModal";

// ============================================================
// AL MADINA RESTAURANT — Policy Context
// Provides global openPolicy('privacy' | 'terms' | 'refund' | 'security' | 'halal')
// so any link anywhere in the app immediately opens the corresponding policy.
// ============================================================

const PolicyContext = createContext(null);

export function PolicyProvider({ children }) {
  const [activePolicy, setActivePolicy] = useState(null);

  const openPolicy = (type = "privacy") => {
    setActivePolicy(type);
  };

  const closePolicy = () => {
    setActivePolicy(null);
  };

  return (
    <PolicyContext.Provider value={{ activePolicy, openPolicy, closePolicy }}>
      {children}
      {activePolicy && (
        <PolicyModal
          type={activePolicy}
          onClose={closePolicy}
          onSelectType={setActivePolicy}
        />
      )}
    </PolicyContext.Provider>
  );
}

export function usePolicy() {
  const ctx = useContext(PolicyContext);
  if (!ctx) {
    return {
      openPolicy: () => {},
      closePolicy: () => {},
      activePolicy: null,
    };
  }
  return ctx;
}
