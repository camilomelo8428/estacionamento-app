import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useEmpresa } from '../../contexts/EmpresaContext';
import './styles.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setError } = useError();
  const { dadosEmpresa } = useEmpresa();
  const currentYear = new Date().getFullYear();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'ADMINISTRADOR' | 'OPERADOR'>('ADMINISTRADOR');
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setErrorState('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="empresa-header">
          <h1>{dadosEmpresa?.nome || 'Estacionamento Jr'}</h1>
        </div>
        
        <div className="tipo-acesso">
          <h2>TIPO DE ACESSO</h2>
          <div className="tipo-buttons">
            <button
              className={userType === 'ADMINISTRADOR' ? 'active' : ''}
              onClick={() => setUserType('ADMINISTRADOR')}
              type="button"
              aria-pressed={userType === 'ADMINISTRADOR'}
            >
              ADMINISTRADOR
            </button>
            <button
              className={userType === 'OPERADOR' ? 'active' : ''}
              onClick={() => setUserType('OPERADOR')}
              type="button"
              aria-pressed={userType === 'OPERADOR'}
            >
              FUNCIONÁRIO
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-MAIL</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="Digite seu e-mail"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">SENHA</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-label="Digite sua senha"
              placeholder="Digite sua senha"
            />
          </div>

          <button 
            type="submit" 
            className="btn-entrar"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
      <footer className="login-footer">
        <div className="footer-content">
          <span>{dadosEmpresa?.endereco || 'Travessa Campos Sales 200'}</span>
          <span className="copyright">© {currentYear} ParkSystem Pro - Sistema Profissional de Gerenciamento de Estacionamento | CamiloTec - Todos os direitos reservados | V1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Login; 