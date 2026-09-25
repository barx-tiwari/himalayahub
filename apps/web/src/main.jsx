import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { DestinationsProvider } from './context/DestinationsContext';
import { ProgressProvider } from './context/ProgressContext';
import './styles/index.css';
import { installSpotlight } from './utils/spotlight';

installSpotlight();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <DestinationsProvider>
              <ProgressProvider>
                <UIProvider>
                  <App />
                </UIProvider>
              </ProgressProvider>
            </DestinationsProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
