import React, { useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';

const ErrorNotification: React.FC = () => {
  const { error, clearError } = useError();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '1rem',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1000,
        maxWidth: '300px'
      }}
    >
      <div style={{ marginBottom: '8px' }}>{error}</div>
      <button
        onClick={clearError}
        style={{
          background: 'transparent',
          border: '1px solid white',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Fechar
      </button>
    </div>
  );
};

export default ErrorNotification; 