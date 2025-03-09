import { supabase } from './supabase';
import { Database } from '../types/supabase';
import { multaService } from './multaService';
import { format, addMonths } from 'date-fns';

type Mensalidade = Database['public']['Tables']['mensalidades']['Row'];
type MensalidadeInsert = Database['public']['Tables']['mensalidades']['Insert'];
type MensalidadeUpdate = Database['public']['Tables']['mensalidades']['Update'];
type MensalistaInsert = Database['public']['Tables']['mensalistas']['Insert'];
type MensalistaUpdate = Database['public']['Tables']['mensalistas']['Update'];

// Função auxiliar para ajustar a data para o fuso horário do Brasil
const ajustarDataBrasil = (data: string) => {
  const dataObj = new Date(data);
  // Ajusta para UTC-3 (Brasil)
  dataObj.setHours(dataObj.getHours() + 3);
  return dataObj.toISOString().split('T')[0];
};

// Função para calcular dias de atraso
const calcularDiasAtraso = (dataVencimento: string) => {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Função para gerar a próxima data de vencimento com base no dia definido
const gerarProximaDataVencimento = (diaVencimento: number) => {
  const hoje = new Date();
  const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
  
  // Se a data de vencimento já passou, avança para o próximo mês
  if (dataVencimento < hoje) {
    dataVencimento.setMonth(dataVencimento.getMonth() + 1);
  }
  
  return dataVencimento.toISOString().split('T')[0];
};

export const mensalidadesService = {
  // Listar todas as mensalidades
  listarMensalidades: async () => {
    try {
      const { data, error } = await supabase
        .from('mensalidades')
        .select(`
          *,
          mensalista:mensalistas (
            id,
            nome,
            cpf,
            email,
            telefone
          )
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;

      // Ajusta as datas para o formato brasileiro
      const mensalidadesFormatadas = data?.map(mensalidade => ({
        ...mensalidade,
        data_vencimento: ajustarDataBrasil(mensalidade.data_vencimento),
        data_pagamento: mensalidade.data_pagamento ? ajustarDataBrasil(mensalidade.data_pagamento) : null
      }));

      return {
        success: true,
        message: 'Mensalidades listadas com sucesso',
        data: mensalidadesFormatadas || []
      };
    } catch (error: any) {
      console.error('Erro ao listar mensalidades:', error);
      return {
        success: false,
        message: error.message || 'Erro ao listar mensalidades',
        data: []
      };
    }
  },

  // Criar nova mensalidade com data de vencimento baseada no dia definido para o mensalista
  criarMensalidade: async (mensalidade: MensalidadeInsert) => {
    try {
      // Buscar o dia de vencimento do mensalista
      const { data: mensalista, error: errorMensalista } = await supabase
        .from('mensalistas')
        .select('dia_vencimento')
        .eq('id', mensalidade.mensalista_id)
        .single();

      if (errorMensalista || !mensalista) {
        throw new Error('Mensalista não encontrado');
      }

      // Gerar data de vencimento baseada no dia definido para o mensalista
      const dataVencimento = gerarProximaDataVencimento(mensalista.dia_vencimento);

      // Garantir que os dados estejam no formato correto
      const mensalidadeFormatada = {
        ...mensalidade,
        valor: Number(mensalidade.valor),
        data_vencimento: dataVencimento,
        status: 'PENDENTE'
      };

      const { data: supabaseData, error } = await supabase
        .from('mensalidades')
        .insert([mensalidadeFormatada])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      return {
        success: true,
        message: 'Mensalidade criada com sucesso',
        data: supabaseData
      };
    } catch (error: any) {
      console.error('Erro ao criar mensalidade:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar mensalidade'
      };
    }
  },

  // Atualizar mensalidade
  atualizarMensalidade: async (id: string, mensalidade: MensalidadeUpdate) => {
    try {
      const { data, error } = await supabase
        .from('mensalidades')
        .update(mensalidade)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Mensalidade atualizada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar mensalidade:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar mensalidade'
      };
    }
  },

  // Registrar pagamento
  registrarPagamento: async (id: string) => {
    try {
      // Buscar mensalidade atual
      const { data: mensalidade, error: errorBusca } = await supabase
        .from('mensalidades')
        .select('*')
        .eq('id', id)
        .single();

      if (errorBusca || !mensalidade) throw new Error('Mensalidade não encontrada');

      // Calcular dias de atraso e multa se necessário
      const diasAtraso = calcularDiasAtraso(mensalidade.data_vencimento);
      let valorMulta = 0;
      let valorJuros = 0;
      let valorTotal = mensalidade.valor;

      if (diasAtraso > 0) {
        const calculoMulta = await multaService.calcularMultaEJuros(mensalidade.valor, diasAtraso);
        if (calculoMulta.success && calculoMulta.data) {
          valorMulta = calculoMulta.data.valor_multa;
          valorJuros = calculoMulta.data.valor_juros;
          valorTotal = calculoMulta.data.valor_total;
        }
      }

      // Registrar pagamento com multa e juros se aplicável
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mensalidades')
        .update({
          status: 'PAGO',
          data_pagamento: hoje,
          valor_multa: valorMulta,
          valor_juros: valorJuros,
          dias_atraso: diasAtraso
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Pagamento registrado com sucesso',
        data: {
          ...data,
          valor_total: valorTotal
        }
      };
    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      return {
        success: false,
        message: error.message || 'Erro ao registrar pagamento'
      };
    }
  },

  // Excluir mensalidade
  excluirMensalidade: async (id: string) => {
    try {
      const { error } = await supabase
        .from('mensalidades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Mensalidade excluída com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao excluir mensalidade:', error);
      return {
        success: false,
        message: error.message || 'Erro ao excluir mensalidade'
      };
    }
  },

  // Verificar e atualizar mensalidades em atraso
  verificarMensalidadesEmAtraso: async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar mensalidades pendentes com data de vencimento anterior a hoje
      const { data: mensalidadesAtrasadas, error } = await supabase
        .from('mensalidades')
        .update({ status: 'ATRASADO' })
        .eq('status', 'PENDENTE')
        .lt('data_vencimento', hoje)
        .select();

      if (error) throw error;

      return {
        success: true,
        message: 'Status das mensalidades atualizado com sucesso',
        data: mensalidadesAtrasadas
      };
    } catch (error: any) {
      console.error('Erro ao verificar mensalidades em atraso:', error);
      return {
        success: false,
        message: error.message || 'Erro ao verificar mensalidades em atraso'
      };
    }
  },

  // Gerar próxima mensalidade automaticamente
  gerarProximaMensalidade: async (mensalistaId: string, diaVencimento: number) => {
    try {
      const proximaData = gerarProximaDataVencimento(diaVencimento);
      
      const { data, error } = await supabase
        .from('mensalidades')
        .insert([{
          mensalista_id: mensalistaId,
          data_vencimento: proximaData,
          status: 'PENDENTE'
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Próxima mensalidade gerada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao gerar próxima mensalidade:', error);
      return {
        success: false,
        message: error.message || 'Erro ao gerar próxima mensalidade'
      };
    }
  },

  pagarMensalidade: async (id: string) => {
    try {
      // Primeiro, buscar a mensalidade atual
      const { data: mensalidade, error: errorBusca } = await supabase
        .from('mensalidades')
        .select(`
          *,
          mensalista:mensalistas (
            id,
            nome,
            cpf,
            email,
            telefone
          )
        `)
        .eq('id', id)
        .single();

      if (errorBusca) throw errorBusca;
      if (!mensalidade) throw new Error('Mensalidade não encontrada');

      // Calcular multa e juros se necessário
      const diasAtraso = calcularDiasAtraso(mensalidade.data_vencimento);
      let valorMulta = 0;
      let valorJuros = 0;
      let valorTotal = mensalidade.valor;

      if (diasAtraso > 0) {
        const calculoMulta = await multaService.calcularMultaEJuros(mensalidade.valor, diasAtraso);
        if (calculoMulta.success && calculoMulta.data) {
          valorMulta = calculoMulta.data.valor_multa;
          valorJuros = calculoMulta.data.valor_juros;
          valorTotal = calculoMulta.data.valor_total;
        }
      }

      // Atualizar mensalidade com os valores calculados
      const { data, error } = await supabase
        .from('mensalidades')
        .update({
          status: 'PAGO',
          data_pagamento: new Date().toISOString(),
          valor_multa: valorMulta,
          valor_juros: valorJuros,
          dias_atraso: diasAtraso
        })
        .eq('id', id)
        .select(`
          *,
          mensalista:mensalistas (
            id,
            nome,
            cpf,
            email,
            telefone
          )
        `)
        .single();

      if (error) throw error;

      // Retornar os dados com o valor total calculado
      return {
        success: true,
        message: 'Mensalidade paga com sucesso',
        data: {
          ...data,
          valor_total: valorTotal
        }
      };
    } catch (error: any) {
      console.error('Erro ao pagar mensalidade:', error);
      return {
        success: false,
        message: error.message || 'Erro ao pagar mensalidade'
      };
    }
  }
}; 