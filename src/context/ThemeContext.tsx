import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
 theme: Theme;
 setTheme: (theme: Theme) => void;
 isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [theme, setThemeState] = useState<Theme>(() => {
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       const saved = window.localStorage.getItem('constrora_theme') as Theme;
       if (saved) return saved;
     }
   } catch {
     // ignore
   }
   return 'light';
 });

 const [isDark, setIsDark] = useState<boolean>(() => {
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       const saved = window.localStorage.getItem('constrora_theme') as Theme;
       if (saved === 'dark') return true;
       if (saved === 'light') return false;
     }
     if (typeof window !== 'undefined' && window.matchMedia) {
       return window.matchMedia('(prefers-color-scheme: dark)').matches;
     }
   } catch {
     // ignore
   }
   return false;
 });

 useEffect(() => {
 const root = document.documentElement;
 const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

 const effectiveDark = theme === 'system' ? systemPrefersDark : theme === 'dark';
 setIsDark(effectiveDark);

 if (effectiveDark) {
 root.classList.add('dark');
 root.classList.remove('light');
 } else {
 root.classList.add('light');
 root.classList.remove('dark');
 }

 localStorage.setItem('constrora_theme', theme);
 }, [theme]);

 const setTheme = (newTheme: Theme) => {
 setThemeState(newTheme);
 };

 return (
 <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
 {children}
 </ThemeContext.Provider>
 );
};

export const useTheme = () => {
 const context = useContext(ThemeContext);
 if (!context) {
 throw new Error('useTheme must be used within ThemeProvider');
 }
 return context;
};
