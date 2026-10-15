import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { AssistantProvider } from './context/AssistantContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AssistantProvider>
            <AppRoutes />
          </AssistantProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
