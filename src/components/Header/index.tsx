import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { useError } from '../../contexts/ErrorContext';
import './styles.css';

export default function Header() {
  const { logout, user } = useAuth();
  const { dadosEmpresa } = useEmpresa();
  const { setError } = useError();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Previne qualquer comportamento padrão
    e.stopPropagation(); // Impede a propagação do evento

    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      // Limpa qualquer dado local antes do logout
      localStorage.clear();
      sessionStorage.clear();
      await logout();
      // Força a navegação para a página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout. Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="empresa-info">
          <h1 className="empresa-nome">{dadosEmpresa?.nome || 'ParkSystem Pro'}</h1>
          {dadosEmpresa?.endereco && (
            <span className="empresa-endereco">{dadosEmpresa.endereco}</span>
          )}
        </div>
        <div className="user-controls">
          <div className="user-info">
            <span className="user-name">Olá, {user?.name}</span>
            <span className="user-type">
              {user?.role === 'ADMINISTRADOR' ? 'Administrador' : 'Funcionário'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className={`btn-logout ${isLoggingOut ? 'loading' : ''}`}
            disabled={isLoggingOut}
            type="button"
            aria-label="Sair do sistema"
          >
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>
    </header>
  );
} 