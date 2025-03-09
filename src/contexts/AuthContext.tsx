import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/user';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      // Limpa dados locais em caso de erro na verificação do usuário
      localStorage.clear();
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await authService.login(email, password);
      
      if (!loggedUser) {
        throw new Error('Credenciais inválidas');
      }

      setUser(loggedUser);
      
      // Se for admin, salva o token especial
      if (loggedUser.role === 'ADMINISTRADOR') {
        localStorage.setItem('admin_token', 'admin_session');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Limpa todos os dados locais
      localStorage.clear();
      sessionStorage.clear();
    } catch (error: any) {
      console.error('Erro durante o logout:', error);
      // Mesmo com erro, limpa os dados locais e o usuário
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMINISTRADOR',
    loading,
    login,
    logout
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 