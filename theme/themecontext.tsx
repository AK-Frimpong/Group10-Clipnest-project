import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => {
      listener.remove();
    };
  }, []);

  const isDarkMode =
    theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  // Your custom colors
  const backgroundColor = isDarkMode ? '#181D1C' : '#F3FAF8'; // Eerie Black or Mint Cream
  const cardColor = isDarkMode ? '#252A29' : '#E2F1ED'; // Optional: slightly different for cards or UI blocks
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDarkMode, backgroundColor, cardColor, textColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
