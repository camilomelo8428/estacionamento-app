import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header/index';
import { useEmpresa } from '../../contexts/EmpresaContext';
import './styles.css';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { dadosEmpresa } = useEmpresa();
  const currentYear = new Date().getFullYear();

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          {children || <Outlet />}
        </main>
        <footer className="footer">
          <div className="footer-content">
            <span>{dadosEmpresa?.endereco || 'Travessa Campos Sales 200'}</span>
            <span className="copyright">© {currentYear} ParkSystem Pro - Sistema Profissional de Gerenciamento de Estacionamento | CamiloTec - Todos os direitos reservados | V1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 