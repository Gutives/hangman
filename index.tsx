
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("App is starting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React Render complete");
}
