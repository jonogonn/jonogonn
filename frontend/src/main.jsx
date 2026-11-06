import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { NewsProvider } from './context/NewsContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <NewsProvider>
          <App />
        </NewsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
