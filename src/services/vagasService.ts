import { supabase } from './supabase';
import { Vaga, VagaRequest, ListaVagasResponse, VagaUnicaResponse } from '../types/vaga';

export const vagasService = {
  // Listar todas as vagas
  listarVagas: async (): Promise<ListaVagasResponse> => {
    try {
      console.log('Buscando vagas do banco de dados...');
      const { data, error } = await supabase
        .from('vagas')
        .select(`
          id,
          numero,
          status,
          placa,
          tipo,
          hora_entrada,
          hora_saida,
          valor_cobrado,
          created_at,
          updated_at,
          categorias (
            id,
            nome,
            vagas
          )
        `)
        .order('numero');

      if (error) {
        console.error('Erro ao buscar vagas:', error);
        throw error;
      }

      console.log('Vagas encontradas:', data);

      return {
        success: true,
        message: 'Vagas listadas com sucesso',
        data: data as Vaga[]
      };
    } catch (error) {
      console.error('Erro ao listar vagas:', error);
      throw error;
    }
  },

  // Buscar vaga específica
  buscarVaga: async (id: string): Promise<VagaUnicaResponse> => {
    try {
      const { data, error } = await supabase
        .from('vagas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Vaga encontrada com sucesso',
        data: data as Vaga
      };
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      throw error;
    }
  },

  // Criar nova vaga
  criarVaga: async (vaga: VagaRequest): Promise<VagaUnicaResponse> => {
    try {
      const { data, error } = await supabase
        .from('vagas')
        .insert([{
          ...vaga,
          status: 'LIVRE',
          placa: null,
          tipo: null,
          hora_entrada: null,
          hora_saida: null,
          valor_cobrado: null
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Vaga criada com sucesso',
        data: data as Vaga
      };
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      throw error;
    }
  },

  // Atualizar vaga
  atualizarVaga: async (id: string, vaga: Partial<Vaga>): Promise<VagaUnicaResponse> => {
    try {
      const { data, error } = await supabase
        .from('vagas')
        .update(vaga)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Vaga atualizada com sucesso',
        data: data as Vaga
      };
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      throw error;
    }
  },

  // Deletar vaga
  deletarVaga: async (id: string): Promise<VagaUnicaResponse> => {
    try {
      const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Vaga deletada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      throw error;
    }
  },

  // Ocupar vaga
  ocuparVaga: async (id: string, placa: string, tipo: 'AVULSO' | 'MENSALISTA' = 'AVULSO'): Promise<VagaUnicaResponse> => {
    try {
      console.log('Tentando ocupar vaga:', { id, placa, tipo });
      
      const { data, error } = await supabase.rpc('ocupar_vaga', {
        p_vaga_id: id,
        p_placa: placa,
        p_hora_entrada: new Date().toISOString(),
        p_tipo: tipo
      });

      if (error) {
        console.error('Erro RPC detalhado:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado ao ocupar vaga');
      }

      console.log('Vaga ocupada com sucesso:', data);

      return {
        success: true,
        message: 'Vaga ocupada com sucesso',
        data: data as Vaga
      };
    } catch (error: any) {
      console.error('Erro ao ocupar vaga:', error);
      throw error;
    }
  },

  // Liberar vaga
  liberarVaga: async (id: string): Promise<VagaUnicaResponse> => {
    try {
      console.log('Tentando liberar vaga:', id);
      
      const { data, error } = await supabase.rpc('liberar_vaga', {
        p_vaga_id: id,
        p_hora_saida: new Date().toISOString()
      });

      if (error) {
        console.error('Erro RPC detalhado:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado ao liberar vaga');
      }

      console.log('Vaga liberada com sucesso:', data);

      return {
        success: true,
        message: 'Vaga liberada com sucesso',
        data: data as Vaga
      };
    } catch (error: any) {
      console.error('Erro ao liberar vaga:', error);
      throw error;
    }
  }
}; 