import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Empresa = Database['public']['Tables']['empresa']['Row'];
type EmpresaInsert = Database['public']['Tables']['empresa']['Insert'];

export const empresaService = {
  // Buscar informações da empresa
  buscarInformacoes: async (): Promise<Empresa | null> => {
    try {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar informações da empresa:', error);
      throw new Error('Erro ao buscar informações da empresa');
    }
  },

  // Atualizar informações da empresa
  salvarInformacoes: async (dados: EmpresaInsert): Promise<void> => {
    try {
      // Primeiro, verifica se já existe um registro
      const { data: registroExistente } = await supabase
        .from('empresa')
        .select('id')
        .single();

      if (registroExistente) {
        // Se existe, atualiza
        const { error: updateError } = await supabase
          .from('empresa')
          .update(dados)
          .eq('id', registroExistente.id);

        if (updateError) throw updateError;
      } else {
        // Se não existe, cria um novo registro
        console.log('Nenhum registro encontrado, criando registro inicial...');
        
        const novaEmpresa: EmpresaInsert = {
          nome: 'Nome da Empresa',
          cnpj: '00.000.000/0000-00',
          email: 'email@empresa.com',
          telefone: null,
          endereco: null,
          mensagem: null
        };

        const { error: insertError } = await supabase
          .from('empresa')
          .insert([novaEmpresa]);

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error('Erro ao salvar informações da empresa:', error);
      throw new Error('Erro ao salvar informações da empresa');
    }
  }
}; 