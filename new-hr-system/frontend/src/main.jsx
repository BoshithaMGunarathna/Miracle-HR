import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './pages/AuthContext.jsx'; // Import AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     {/* Wrap App with AuthProvider */}
      <App />
 
  </React.StrictMode>
);
