import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProjectProvider } from './context/ProjectContext.tsx';
import { SavedProvider } from './context/SavedContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { migrateLocalStorageKeys } from './utils/migration.ts';
import './index.css';

// Perform one-time migration of legacy localStorage keys
migrateLocalStorageKeys();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <SavedProvider>
              <App />
            </SavedProvider>
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

