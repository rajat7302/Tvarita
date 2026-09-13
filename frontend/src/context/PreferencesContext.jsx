import React, { createContext, useState } from 'react';

export const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const togglePreference = (category) => {
    setSelectedPreferences(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  return (
    <PreferencesContext.Provider value={{ selectedPreferences, setSelectedPreferences, togglePreference }}>
      {children}
    </PreferencesContext.Provider>
  );
};