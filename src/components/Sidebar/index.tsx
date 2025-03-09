import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { 
  HomeOutlined, 
  BarChartOutlined, 
  TeamOutlined, 
  CarOutlined, 
  FileOutlined,
  IdcardOutlined,
  BankOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined
} from '@ant-design/icons';
import './styles.css';

const HomeIcon = () => <HomeOutlined style={{ color: '#1976d2' }} />;
const DashboardIcon = () => <BarChartOutlined style={{ color: '#1976d2' }} />;
const SubscriptionIcon = () => <TeamOutlined style={{ color: '#1976d2' }} />;
const MonthlyIcon = () => <CreditCardOutlined style={{ color: '#1976d2' }} />;
const CategoriesIcon = () => <FileOutlined style={{ color: '#1976d2' }} />;
const CompanyIcon = () => <BankOutlined style={{ color: '#1976d2' }} />;
const EmployeesIcon = () => <UserOutlined style={{ color: '#1976d2' }} />;
const ParkingIcon = () => <CarOutlined style={{ color: '#1976d2' }} />;
const TicketsIcon = () => <FileOutlined style={{ color: '#1976d2' }} />;
const TicketsMensalistasIcon = () => <IdcardOutlined style={{ color: '#1976d2' }} />;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const { dadosEmpresa } = useEmpresa();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Adiciona ou remove a classe menu-open do body
    if (isOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup ao desmontar o componente
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onToggle(); // Fecha o menu em dispositivos móveis após a navegação
    }
  };

  const menuItems = [
    {
      title: "GESTÃO",
      items: [
        { 
          name: "Home",
          icon: <HomeIcon />,
          path: "/",
          admin: false
        },
        { 
          name: "Dashboard Financeiro",
          icon: <DashboardIcon />,
          path: "/dashboard",
          admin: true
        },
        { 
          name: "Mensalistas",
          icon: <SubscriptionIcon />,
          path: "/mensalistas",
          admin: false
        },
        { 
          name: "Mensalidades",
          icon: <MonthlyIcon />,
          path: "/mensalidades",
          admin: false
        },
        { 
          name: "Categorias",
          icon: <CategoriesIcon />,
          path: "/categorias",
          admin: true
        },
        { 
          name: "Dados da empresa",
          icon: <CompanyIcon />,
          path: "/dados-empresa",
          admin: true
        },
        { 
          name: "Funcionários",
          icon: <EmployeesIcon />,
          path: "/funcionarios",
          admin: true
        }
      ]
    },
    {
      title: "ESTACIONAR",
      items: [
        { 
          name: "Gerenciar Vagas",
          icon: <ParkingIcon />,
          path: "/gerenciar",
          admin: false
        },
        { 
          name: "Tickets Avulsos",
          icon: <TicketsIcon />,
          path: "/tickets",
          admin: false
        },
        { 
          name: "Tickets Mensalistas",
          icon: <TicketsMensalistasIcon />,
          path: "/tickets-mensalistas",
          admin: false
        }
      ]
    }
  ];

  return (
    <>
      <button 
        className="menu-toggle"
        onClick={onToggle}
        aria-label="Toggle menu"
      >
        <MenuOutlined />
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={() => onToggle()} />
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>{dadosEmpresa?.nome || 'ParkSystem Pro'}</h1>
          {dadosEmpresa?.endereco && (
            <p className="empresa-endereco">{dadosEmpresa.endereco}</p>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section, index) => (
            <div key={index} className="menu-section">
              <h2 className="section-title">{section.title}</h2>
              {section.items.map((item, itemIndex) => (
                ((user?.role === 'ADMINISTRADOR' && item.admin) || !item.admin) && (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.name}</span>
                  </Link>
                )
              ))}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 