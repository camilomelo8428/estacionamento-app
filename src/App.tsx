import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VagasProvider } from './contexts/VagasContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { EmpresaProvider } from './contexts/EmpresaContext';
import ErrorNotification from './components/ErrorNotification';
import { AppRoutes } from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <EmpresaProvider>
          <VagasProvider>
            <BrowserRouter>
              <ErrorNotification />
              <AppRoutes />
              <ToastContainer />
            </BrowserRouter>
          </VagasProvider>
        </EmpresaProvider>
      </AuthProvider>
    </ErrorProvider>
  );
};

export default App;