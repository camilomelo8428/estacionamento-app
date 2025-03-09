import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Mensalista = Database['public']['Tables']['mensalistas']['Row'] & { veiculos: VeiculoMensalista[] };
type VeiculoMensalista = Database['public']['Tables']['veiculos_mensalistas']['Row'];
type MensalistaInsert = Database['public']['Tables']['mensalistas']['Insert'];
type MensalistaUpdate = Database['public']['Tables']['mensalistas']['Update'];

interface ListaMensalistasResponse {
  success: boolean;
  message: string;
  data: Mensalista[];
}

interface MensalistaUnicoResponse {
  success: boolean;
  message: string;
  data?: Mensalista;
}

interface StatusMensalistaResponse {
  success: boolean;
  message: string;
  data?: {
    possuiPendencias: boolean;
    mensalidadesAtrasadas: number;
    mensalidadesPendentes: number;
  };
}

interface ListaVeiculosResponse {
  success: boolean;
  message: string;
  data: VeiculoMensalista[];
}

export const mensalistasService = {
  // Listar todos os mensalistas
  listarMensalistas: async (): Promise<ListaMensalistasResponse> => {
    try {
      const { data, error } = await supabase
        .from('mensalistas')
        .select(`
          *,
          veiculos:veiculos_mensalistas (*)
        `)
        .order('nome');

      if (error) throw error;

      // Garante que veiculos é sempre um array
      const mensalistasComVeiculos = (data || []).map(mensalista => ({
        ...mensalista,
        veiculos: mensalista.veiculos || []
      }));

      return {
        success: true,
        message: 'Mensalistas listados com sucesso',
        data: mensalistasComVeiculos
      };
    } catch (error: any) {
      console.error('Erro ao listar mensalistas:', error);
      return {
        success: false,
        message: error.message || 'Erro ao listar mensalistas',
        data: []
      };
    }
  },

  // Buscar mensalista específico
  buscarMensalista: async (id: string): Promise<MensalistaUnicoResponse> => {
    try {
      const { data, error } = await supabase
        .from('mensalistas')
        .select(`
          *,
          veiculos:veiculos_mensalistas (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Garante que veiculos é sempre um array
      const mensalistaComVeiculos = {
        ...data,
        veiculos: data.veiculos || []
      };

      return {
        success: true,
        message: 'Mensalista encontrado com sucesso',
        data: mensalistaComVeiculos
      };
    } catch (error: any) {
      console.error('Erro ao buscar mensalista:', error);
      return {
        success: false,
        message: error.message || 'Erro ao buscar mensalista'
      };
    }
  },

  // Criar novo mensalista
  criarMensalista: async (mensalista: MensalistaInsert): Promise<MensalistaUnicoResponse> => {
    try {
      const { data, error } = await supabase
        .from('mensalistas')
        .insert([mensalista])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Mensalista criado com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao criar mensalista:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar mensalista'
      };
    }
  },

  // Atualizar mensalista
  atualizarMensalista: async (id: string, dados: Partial<Mensalista>) => {
    try {
      const { data, error } = await supabase
        .from('mensalistas')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Mensalista atualizado com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar mensalista:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar mensalista'
      };
    }
  },

  // Excluir mensalista
  excluirMensalista: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('mensalistas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Mensalista excluído com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao excluir mensalista:', error);
      return {
        success: false,
        message: error.message || 'Erro ao excluir mensalista'
      };
    }
  },

  // Adicionar veículo ao mensalista
  adicionarVeiculo: async (dados: Omit<VeiculoMensalista, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Verifica se já existe um veículo com a mesma placa
      const { data: existente } = await supabase
        .from('veiculos_mensalistas')
        .select('id')
        .eq('placa', dados.placa)
        .maybeSingle();

      if (existente) {
        throw new Error('Já existe um veículo cadastrado com esta placa');
      }

      const { data, error } = await supabase
        .from('veiculos_mensalistas')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Erro ao adicionar veículo:', error);
      throw new Error(error.message || 'Erro ao adicionar veículo');
    }
  },

  // Remover veículo do mensalista
  removerVeiculo: async (id: string) => {
    try {
      const { error } = await supabase
        .from('veiculos_mensalistas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao remover veículo:', error);
      throw new Error(error.message || 'Erro ao remover veículo');
    }
  },

  // Buscar veículos de um mensalista
  listarVeiculos: async (mensalistaId: string): Promise<ListaVeiculosResponse> => {
    try {
      const { data, error } = await supabase
        .from('veiculos_mensalistas')
        .select('*')
        .eq('mensalista_id', mensalistaId);

      if (error) throw error;

      return {
        success: true,
        message: 'Veículos listados com sucesso',
        data: data || []
      };
    } catch (error: any) {
      console.error('Erro ao listar veículos:', error);
      return {
        success: false,
        message: error.message || 'Erro ao listar veículos',
        data: []
      };
    }
  },

  verificarStatusMensalista: async (mensalistaId: string): Promise<StatusMensalistaResponse> => {
    try {
      const { data: mensalidades, error } = await supabase
        .from('mensalidades')
        .select('*')
        .eq('mensalista_id', mensalistaId)
        .or('status.eq.PENDENTE,status.eq.ATRASADO');

      if (error) throw error;

      const mensalidadesAtrasadas = mensalidades?.filter(m => m.status === 'ATRASADO').length || 0;
      const mensalidadesPendentes = mensalidades?.filter(m => m.status === 'PENDENTE').length || 0;
      const possuiPendencias = mensalidadesAtrasadas > 0 || mensalidadesPendentes > 0;

      let message = 'Mensalista está em dia com os pagamentos.';
      if (possuiPendencias) {
        message = `Mensalista possui ${mensalidadesPendentes} mensalidade(s) pendente(s) e ${mensalidadesAtrasadas} mensalidade(s) em atraso.`;
      }

      return {
        success: true,
        message,
        data: {
          possuiPendencias,
          mensalidadesAtrasadas,
          mensalidadesPendentes
        }
      };
    } catch (error: any) {
      console.error('Erro ao verificar status do mensalista:', error);
      return {
        success: false,
        message: 'Erro ao verificar status do mensalista'
      };
    }
  }
}; 