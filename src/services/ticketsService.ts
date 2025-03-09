import { supabase } from './supabase';
import { vagasService } from './vagasService';
import { Ticket, TicketRequest } from '../types/ticket';
import { Database } from '../types/supabase';

type SupabaseTicket = Omit<Database['public']['Tables']['tickets']['Row'], 'hora_saida'> & {
  cor: string;
  categoria: 'PEQUENO' | 'GRANDE' | 'ESPECIAL' | 'CARRINHO';
  vaga_id: string;
  veiculo_id?: string;
  hora_saida?: string;
};

interface BaseResponse {
  success: boolean;
  message: string;
}

interface TicketUnicoResponse extends BaseResponse {
  data?: SupabaseTicket;
}

interface ListaTicketsResponse extends BaseResponse {
  data: SupabaseTicket[];
}

export const ticketsService = {
  // Listar todos os tickets
  listarTickets: async (): Promise<ListaTicketsResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          mensalista:mensalistas(
            id,
            nome,
            cpf,
            email,
            telefone
          ),
          veiculo:veiculos_mensalistas(
            id,
            placa,
            modelo,
            cor
          )
        `)
        .eq('tipo', 'AVULSO')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets listados com sucesso',
        data: data || []
      };
    } catch (error) {
      console.error('Erro ao listar tickets:', error);
      throw error;
    }
  },

  // Buscar ticket específico
  buscarTicket: async (id: string): Promise<TicketUnicoResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          vaga_id
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Ticket encontrado com sucesso',
        data: data as SupabaseTicket
      };
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
      throw error;
    }
  },

  // Criar novo ticket
  criarTicket: async (request: TicketRequest): Promise<TicketUnicoResponse> => {
    try {
      // Ocupar a vaga primeiro
      const vagaResponse = await vagasService.ocuparVaga(request.vaga_id, request.placa, request.tipo || 'AVULSO');
      
      if (!vagaResponse.success) {
        throw new Error(vagaResponse.message);
      }

      // Criar o ticket
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          placa: request.placa,
          modelo: request.modelo,
          cor: request.cor,
          categoria: request.categoria,
          vaga_id: request.vaga_id,
          tipo: request.tipo || 'AVULSO',
          status: 'ABERTO',
          hora_entrada: new Date().toISOString(),
          mensalista_id: request.mensalista_id,
          veiculo_id: request.veiculo_id
        }])
        .select(`
          *,
          mensalistas (
            id,
            nome,
            cpf,
            email,
            telefone
          ),
          veiculos_mensalistas (
            id,
            placa,
            modelo,
            cor
          )
        `)
        .single();

      if (error) {
        // Se houver erro ao criar o ticket, tentar liberar a vaga
        await vagasService.liberarVaga(request.vaga_id);
        throw error;
      }

      return {
        success: true,
        message: 'Ticket criado com sucesso',
        data: {
          ...data,
          cor: request.cor,
          categoria: request.categoria,
          vaga_id: request.vaga_id,
          veiculo_id: request.veiculo_id,
          hora_saida: data.hora_saida || undefined
        } as SupabaseTicket
      };
    } catch (error: any) {
      console.error('Erro ao criar ticket:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar ticket'
      };
    }
  },

  // Fechar ticket
  fecharTicket: async (id: string, valorTotal: number): Promise<TicketUnicoResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'FECHADO',
          hora_saida: new Date().toISOString(),
          valor_total: valorTotal
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Ticket fechado com sucesso',
        data: data as SupabaseTicket
      };
    } catch (error) {
      console.error('Erro ao fechar ticket:', error);
      throw error;
    }
  },

  // Buscar tickets abertos
  buscarTicketsAbertos: async (): Promise<ListaTicketsResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'ABERTO')
        .eq('tipo', 'AVULSO')
        .order('hora_entrada', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets abertos listados com sucesso',
        data: data as SupabaseTicket[]
      };
    } catch (error) {
      console.error('Erro ao buscar tickets abertos:', error);
      throw error;
    }
  },

  // Buscar tickets fechados por período
  buscarTicketsFechados: async (dataInicio: string, dataFim: string): Promise<ListaTicketsResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'FECHADO')
        .eq('tipo', 'AVULSO')
        .gte('hora_saida', dataInicio)
        .lte('hora_saida', dataFim)
        .order('hora_saida', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets fechados listados com sucesso',
        data: data as SupabaseTicket[]
      };
    } catch (error) {
      console.error('Erro ao buscar tickets fechados:', error);
      throw error;
    }
  },

  listarTicketsMensalistas: async (): Promise<ListaTicketsResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          mensalista:mensalistas(
            id,
            nome,
            cpf,
            email,
            telefone
          ),
          veiculo:veiculos_mensalistas(
            id,
            placa,
            modelo,
            cor
          )
        `)
        .eq('tipo', 'MENSALISTA')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets de mensalistas listados com sucesso',
        data: data || []
      };
    } catch (error) {
      console.error('Erro ao listar tickets de mensalistas:', error);
      throw error;
    }
  },

  removerTicket: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Primeiro buscar o ticket para obter o vaga_id
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('vaga_id')
        .eq('id', id)
        .single();

      if (ticketError) throw ticketError;

      // Remover o ticket
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar a vaga para status LIVRE
      if (ticket?.vaga_id) {
        const { error: vagaError } = await supabase
          .from('vagas')
          .update({
            status: 'LIVRE',
            placa: null,
            hora_entrada: null,
            hora_saida: null,
            valor_cobrado: null
          })
          .eq('id', ticket.vaga_id);

        if (vagaError) throw vagaError;
      }

      return {
        success: true,
        message: 'Ticket removido com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao remover ticket:', error);
      throw new Error(error.message || 'Erro ao remover ticket');
    }
  },

  // Calcular valor do ticket
  calcularValorTicket: async (id: string): Promise<{ success: boolean; message: string; data: { valorTotal: number } }> => {
    try {
      console.log('Iniciando cálculo do valor do ticket:', id);

      // Primeiro, buscar o ticket com o vaga_id
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*, vaga_id')
        .eq('id', id)
        .single();

      if (ticketError || !ticket) {
        console.error('Erro ao buscar ticket:', ticketError);
        throw new Error('Ticket não encontrado');
      }

      console.log('Ticket encontrado:', ticket);

      // Se for ticket de mensalista, retorna valor zero
      if (ticket.tipo === 'MENSALISTA') {
        return {
          success: true,
          message: 'Valor calculado com sucesso',
          data: {
            valorTotal: 0
          }
        };
      }

      // Buscar a vaga para obter a categoria
      const { data: vaga, error: vagaError } = await supabase
        .from('vagas')
        .select('categoria_id')
        .eq('id', ticket.vaga_id)
        .single();

      if (vagaError || !vaga) {
        console.error('Erro ao buscar vaga:', vagaError);
        throw new Error('Vaga não encontrada');
      }

      // Buscar valor da hora da categoria
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('preco_hora')
        .eq('id', vaga.categoria_id)
        .single();

      if (categoriaError || !categoria || !categoria.preco_hora) {
        console.error('Erro ao buscar categoria:', categoriaError);
        throw new Error('Categoria não encontrada ou preço não definido');
      }

      const entrada = new Date(ticket.hora_entrada);
      const saida = new Date();
      const diffMillis = saida.getTime() - entrada.getTime();
      
      // Converter para minutos
      const diffMinutos = diffMillis / (1000 * 60);
      
      // Primeira hora é cobrada integralmente
      let valorTotal = categoria.preco_hora;
      
      // Se passou de 1 hora, calcular horas adicionais
      if (diffMinutos > 60) {
        // Subtrair a primeira hora e arredondar para cima as horas adicionais
        const horasAdicionais = Math.ceil((diffMinutos - 60) / 60);
        valorTotal += horasAdicionais * categoria.preco_hora;
      }

      console.log('Valor calculado:', {
        diffMinutos,
        valorHora: categoria.preco_hora,
        valorTotal,
        entrada: entrada.toISOString(),
        saida: saida.toISOString(),
        exemploDuracao: `${Math.floor(diffMinutos / 60)}h${Math.floor(diffMinutos % 60)}min`
      });

      return {
        success: true,
        message: 'Valor calculado com sucesso',
        data: {
          valorTotal
        }
      };
    } catch (error: any) {
      console.error('Erro ao calcular valor do ticket:', error);
      throw error;
    }
  },

  // Encerrar ticket
  encerrarTicket: async (id: string): Promise<TicketUnicoResponse> => {
    try {
      console.log('Iniciando encerramento do ticket:', id);

      // Primeiro, calcular o valor do ticket
      const valorResponse = await ticketsService.calcularValorTicket(id);
      if (!valorResponse.success) {
        throw new Error('Erro ao calcular valor do ticket');
      }

      // Buscar o ticket para obter o vaga_id
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (ticketError || !ticket) {
        console.error('Erro ao buscar ticket:', ticketError);
        throw new Error('Ticket não encontrado');
      }

      // Liberar a vaga primeiro
      if (ticket.vaga_id) {
        console.log('Liberando vaga:', ticket.vaga_id);
        await vagasService.liberarVaga(ticket.vaga_id);
      }

      // Atualizar o status do ticket e registrar o valor
      console.log('Atualizando status do ticket para FECHADO');
      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'FECHADO',
          hora_saida: new Date().toISOString(),
          valor_total: valorResponse.data.valorTotal
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar ticket:', error);
        throw error;
      }

      console.log('Ticket encerrado com sucesso');

      return {
        success: true,
        message: 'Ticket encerrado com sucesso',
        data: data as SupabaseTicket
      };
    } catch (error: any) {
      console.error('Erro ao encerrar ticket:', error);
      throw error;
    }
  },

  // Limpar todos os tickets
  limparTickets: async (): Promise<TicketUnicoResponse> => {
    try {
      const { error } = await supabase.rpc('limpar_tickets');

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets limpos com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao limpar tickets:', error);
      return {
        success: false,
        message: error.message || 'Erro ao limpar tickets'
      };
    }
  },

  // Deletar um ticket específico
  deletarTicket: async (ticketId: string): Promise<TicketUnicoResponse> => {
    try {
      const { error } = await supabase.rpc('deletar_ticket', {
        p_ticket_id: ticketId
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Ticket deletado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao deletar ticket:', error);
      return {
        success: false,
        message: error.message || 'Erro ao deletar ticket'
      };
    }
  },

  // Buscar todos os tickets
  buscarTodos: async (): Promise<ListaTicketsResponse> => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          mensalistas (
            id,
            nome,
            cpf,
            email,
            telefone
          ),
          veiculos_mensalistas (
            id,
            placa,
            modelo,
            cor
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        message: 'Tickets encontrados com sucesso',
        data: data.map(ticket => ({
          ...ticket,
          cor: ticket.cor || '',
          categoria: ticket.categoria || 'PEQUENO',
          vaga_id: ticket.vaga_id || '',
          veiculo_id: ticket.veiculo_id,
          hora_saida: ticket.hora_saida || undefined
        })) as SupabaseTicket[]
      };
    } catch (error: any) {
      console.error('Erro ao buscar tickets:', error);
      return {
        success: false,
        message: error.message || 'Erro ao buscar tickets',
        data: []
      };
    }
  }
}; 