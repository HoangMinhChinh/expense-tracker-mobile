// ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  background: string;
  text: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  border: string;
  button: string;
  buttonText: string;
  primary: string;
  onPrimary: string;
}

export const lightTheme: Theme = {
  background: '#f9f9f9',
  text: '#000',
  inputBg: '#fff',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
  button: '#007bff',
  buttonText: '#fff',
  primary: '#d9534f',
  onPrimary: '#fff',
};

export const darkTheme: Theme = {
  background: '#2d2d2d',
  text: '#fff',
  inputBg: '#3d3d3d',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#555',
  button: '#0056b3',
  buttonText: '#fff',
  primary: '#d9534f',
  onPrimary: '#fff',
};

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
export { ThemeContext };
