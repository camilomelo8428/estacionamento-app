import { supabase } from './supabase';
import { User } from '../types/user';

// Credenciais do administrador
const ADMIN_EMAIL = 'camilomelo8428@gmail.com';
const ADMIN_PASSWORD = '071012';

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Se for tentativa de login do admin, verifica as credenciais diretamente
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        if (password !== ADMIN_PASSWORD) {
          throw new Error('Senha incorreta');
        }

        // Para o admin, não precisamos verificar no Supabase Auth
        return {
          id: 'admin-id',
          email: ADMIN_EMAIL,
          name: 'Camilo Melo',
          role: 'ADMINISTRADOR',
          type: 'ADMINISTRADOR',
          tipo: 'ADMINISTRADOR',
          ativo: true
        };
      }

      // Para outros usuários, usa autenticação do Supabase
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro de autenticação:', error.message);
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Busca dados do funcionário
      const { data: funcionario, error: funcionarioError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (funcionarioError) {
        console.error('Erro ao buscar funcionário:', funcionarioError.message);
        throw new Error('Erro ao buscar dados do funcionário');
      }

      if (!funcionario) {
        throw new Error('Funcionário não encontrado ou inativo');
      }

      return {
        id: funcionario.id,
        email: funcionario.email,
        name: funcionario.nome,
        role: funcionario.tipo,
        type: funcionario.tipo,
        tipo: funcionario.tipo,
        ativo: funcionario.ativo
      };
    } catch (error: any) {
      console.error('Erro no processo de login:', error);
      throw new Error(error.message || 'Erro ao realizar login');
    }
  },

  logout: async () => {
    try {
      // Primeiro tenta fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpa todos os dados locais
      localStorage.clear();
      sessionStorage.clear();
      
      // Aguarda um pequeno delay para garantir que tudo foi limpo
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, tenta limpar os dados locais
      localStorage.clear();
      sessionStorage.clear();
      throw new Error(error.message || 'Erro ao realizar logout');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Verifica se é o admin pelo token especial
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        return {
          id: 'admin-id',
          email: ADMIN_EMAIL,
          name: 'Camilo Melo',
          role: 'ADMINISTRADOR',
          type: 'ADMINISTRADOR',
          tipo: 'ADMINISTRADOR',
          ativo: true
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Busca dados do funcionário
      const { data: funcionario, error: funcionarioError } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('email', user.email)
        .eq('ativo', true)
        .single();

      if (funcionarioError || !funcionario) {
        console.error('Erro ao buscar funcionário:', funcionarioError?.message);
        return null;
      }

      return {
        id: funcionario.id,
        email: funcionario.email,
        name: funcionario.nome,
        role: funcionario.tipo,
        type: funcionario.tipo,
        tipo: funcionario.tipo,
        ativo: funcionario.ativo
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      return null;
    }
  },

  isAdmin: async () => {
    const user = await authService.getCurrentUser();
    return user?.role === 'ADMINISTRADOR';
  },

  isAuthenticated: async () => {
    const user = await authService.getCurrentUser();
    return !!user;
  }
}; 