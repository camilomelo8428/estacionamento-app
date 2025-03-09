import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Funcionario = Database['public']['Tables']['funcionarios']['Row'];
type BaseFuncionarioInsert = Database['public']['Tables']['funcionarios']['Insert'];
type FuncionarioUpdate = Database['public']['Tables']['funcionarios']['Update'];

interface FuncionarioInsert extends Omit<BaseFuncionarioInsert, 'auth_user_id' | 'created_at'> {
  senha: string;
}

interface BaseResponse {
  success: boolean;
  message: string;
}

interface ListaFuncionariosResponse extends BaseResponse {
  data: Funcionario[];
}

interface FuncionarioUnicoResponse extends BaseResponse {
  data?: Funcionario;
}

const validarEmail = (email: string): boolean => {
  // Regex para validação de e-mail mais rigorosa
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const funcionariosService = {
  // Listar todos os funcionários
  listarFuncionarios: async (): Promise<ListaFuncionariosResponse> => {
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .order('nome');

      if (error) throw error;

      return {
        success: true,
        message: 'Funcionários listados com sucesso',
        data: data || []
      };
    } catch (error: any) {
      console.error('Erro ao listar funcionários:', error);
      return {
        success: false,
        message: error.message || 'Erro ao listar funcionários',
        data: []
      };
    }
  },

  // Criar novo funcionário
  criarFuncionario: async (funcionario: FuncionarioInsert): Promise<FuncionarioUnicoResponse> => {
    try {
      // Cria o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: funcionario.email,
        password: funcionario.senha,
        options: {
          data: {
            nome: funcionario.nome,
            tipo: funcionario.tipo
          }
        }
      });

      if (authError) {
        console.error('Erro na autenticação:', authError);
        return {
          success: false,
          message: 'Erro ao criar usuário: ' + authError.message
        };
      }

      if (!authData.user?.id) {
        throw new Error('Erro ao criar usuário na autenticação');
      }

      // Cria o registro na tabela funcionarios
      const { data, error } = await supabase
        .from('funcionarios')
        .insert([{
          nome: funcionario.nome,
          email: funcionario.email,
          tipo: funcionario.tipo,
          ativo: true,
          auth_user_id: authData.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar registro:', error);
        // Se houver erro ao criar o registro, remove o usuário do Auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          message: 'Erro ao criar registro do funcionário: ' + error.message
        };
      }

      return {
        success: true,
        message: 'Funcionário criado com sucesso. Um e-mail de confirmação foi enviado.',
        data
      };
    } catch (error: any) {
      console.error('Erro ao criar funcionário:', error);
      return {
        success: false,
        message: 'Erro ao criar funcionário: ' + error.message
      };
    }
  },

  // Atualizar funcionário
  atualizarFuncionario: async (id: string, funcionario: FuncionarioUpdate): Promise<FuncionarioUnicoResponse> => {
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .update(funcionario)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Funcionário atualizado com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar funcionário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar funcionário'
      };
    }
  },

  // Alterar status do funcionário
  alterarStatus: async (id: string, ativo: boolean): Promise<BaseResponse> => {
    try {
      console.log('Iniciando alteração de status:', { id, ativo });

      // Primeiro, verifica se o funcionário existe
      const { data: funcionario, error: errorCheck } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('id', id)
        .single();

      if (errorCheck || !funcionario) {
        throw new Error('Funcionário não encontrado');
      }

      // Realiza a atualização
      const { error } = await supabase
        .from('funcionarios')
        .update({ ativo })
        .eq('id', id);

      if (error) {
        console.error('Erro na atualização:', error);
        throw error;
      }

      console.log('Status alterado com sucesso');

      return {
        success: true,
        message: `Funcionário ${ativo ? 'ativado' : 'desativado'} com sucesso`
      };
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      return {
        success: false,
        message: error.message || 'Erro ao alterar status do funcionário'
      };
    }
  },

  // Remover funcionário permanentemente
  removerFuncionario: async (id: string): Promise<BaseResponse> => {
    try {
      console.log('Iniciando remoção do funcionário:', id);

      // Primeiro, busca o funcionário para obter o auth_user_id
      const { data: funcionario, error: errorCheck } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('id', id)
        .single();

      if (errorCheck || !funcionario) {
        throw new Error('Funcionário não encontrado');
      }

      // Remove o registro da tabela funcionarios
      const { error: deleteError } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erro ao deletar funcionário:', deleteError);
        throw deleteError;
      }

      // Se o funcionário tinha um auth_user_id, remove também do Auth
      if (funcionario.auth_user_id) {
        const { error: authError } = await supabase.auth.admin.deleteUser(
          funcionario.auth_user_id
        );

        if (authError) {
          console.error('Erro ao deletar usuário do Auth:', authError);
          // Não lançamos o erro aqui pois o registro já foi removido da tabela
        }
      }

      console.log('Funcionário removido com sucesso');

      return {
        success: true,
        message: 'Funcionário removido com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao remover funcionário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao remover funcionário'
      };
    }
  }
}; 