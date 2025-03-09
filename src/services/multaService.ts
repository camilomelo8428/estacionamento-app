import { supabase } from './supabase';
import { Database } from '../types/supabase';

type ConfiguracaoMulta = Database['public']['Tables']['configuracoes_multa']['Row'];
type ConfiguracaoMultaUpdate = Database['public']['Tables']['configuracoes_multa']['Update'];

export const multaService = {
  // Obter configuração atual da multa
  obterConfiguracao: async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_multa')
        .select('*')
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Configuração obtida com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao obter configuração de multa:', error);
      return {
        success: false,
        message: error.message || 'Erro ao obter configuração de multa'
      };
    }
  },

  // Atualizar configuração de multa
  atualizarConfiguracao: async (config: ConfiguracaoMultaUpdate) => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_multa')
        .update(config)
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Configuração atualizada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar configuração de multa:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar configuração de multa'
      };
    }
  },

  // Calcular multa e juros
  calcularMultaEJuros: async (valor: number, diasAtraso: number) => {
    try {
      const config = await multaService.obterConfiguracao();
      if (!config.success || !config.data) {
        throw new Error('Erro ao obter configuração de multa');
      }

      const { percentual_multa, percentual_juros_dia } = config.data;
      
      const valorMulta = valor * (percentual_multa / 100);
      const valorJuros = valor * ((percentual_juros_dia / 100) * diasAtraso);

      return {
        success: true,
        data: {
          valor_multa: Number(valorMulta.toFixed(2)),
          valor_juros: Number(valorJuros.toFixed(2)),
          dias_atraso: diasAtraso,
          valor_total: Number((valor + valorMulta + valorJuros).toFixed(2))
        }
      };
    } catch (error: any) {
      console.error('Erro ao calcular multa e juros:', error);
      return {
        success: false,
        message: error.message || 'Erro ao calcular multa e juros'
      };
    }
  }
}; 