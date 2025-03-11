import { supabase } from './supabase';
import { Database } from '../types/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type Mensalidade = Database['public']['Tables']['mensalidades']['Row'];

interface DadosDashboard {
  faturamentoDiario: number;
  ticketsEmitidos: number;
  ticketsAtivos: number;
  mensalidadesEmAtraso: number;
}

interface DadosFaturamento {
  nome: string;
  valor: number;
}

interface DadosTickets {
  nome: string;
  valor: number;
}

interface DadosOcupacao {
  nome: string;
  valor: number;
}

export const financeiroService = {
  // Buscar dados do dashboard
  buscarDadosDashboard: async (dataInicio?: string, dataFim?: string): Promise<DadosDashboard> => {
    try {
      const hoje = new Date();
      
      // Ajusta para o início e fim do dia no horário de Brasília (UTC-3)
      const dataInicioObj = dataInicio 
        ? new Date(dataInicio) 
        : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      
      const dataFimObj = dataFim 
        ? new Date(dataFim) 
        : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

      // Formata as datas para o formato YYYY-MM-DD
      const dataInicioFormatada = dataInicioObj.toISOString().split('T')[0];
      const dataFimFormatada = dataFimObj.toISOString().split('T')[0];

      console.log('Buscando faturamento para o período:');
      console.log('Data Início:', dataInicioFormatada);
      console.log('Data Fim:', dataFimFormatada);

      // Buscar tickets fechados no período
      const { data: ticketsFechados, error: errorTickets } = await supabase
        .from('tickets')
        .select('valor_total, tipo, hora_saida, hora_entrada')
        .eq('status', 'FECHADO')
        .eq('tipo', 'AVULSO')
        .gte('hora_saida', `${dataInicioFormatada}T00:00:00`)
        .lte('hora_saida', `${dataFimFormatada}T23:59:59`);

      if (errorTickets) {
        console.error('Erro ao buscar tickets:', errorTickets);
        throw new Error('Erro ao buscar tickets fechados');
      }

      console.log('Tickets encontrados:', ticketsFechados?.length || 0);
      
      // Calcular faturamento de tickets avulsos
      const faturamentoTicketsAvulsos = ticketsFechados?.reduce((total, ticket) => {
        console.log('Processando ticket:', {
          valor: ticket.valor_total,
          entrada: new Date(ticket.hora_entrada).toLocaleString('pt-BR'),
          saida: new Date(ticket.hora_saida!).toLocaleString('pt-BR')
        });
        return total + (ticket.valor_total || 0);
      }, 0) || 0;

      console.log('Faturamento Tickets Avulsos:', faturamentoTicketsAvulsos);

      // Buscar mensalidades pagas no período
      const { data: mensalidadesPagas, error: errorMensalidades } = await supabase
        .from('mensalidades')
        .select('valor, valor_multa, valor_juros, data_pagamento')
        .eq('status', 'PAGO')
        .gte('data_pagamento', dataInicioFormatada)
        .lte('data_pagamento', dataFimFormatada);

      if (errorMensalidades) {
        console.error('Erro ao buscar mensalidades:', errorMensalidades);
        throw new Error('Erro ao buscar mensalidades pagas');
      }

      console.log('Mensalidades encontradas:', mensalidadesPagas?.length || 0);

      // Calcular faturamento de mensalidades
      const faturamentoMensalidades = mensalidadesPagas?.reduce((total, mensalidade) => {
        const valorTotal = (mensalidade.valor || 0) + (mensalidade.valor_multa || 0) + (mensalidade.valor_juros || 0);
        console.log('Processando mensalidade:', {
          data: mensalidade.data_pagamento,
          valorBase: mensalidade.valor,
          multa: mensalidade.valor_multa,
          juros: mensalidade.valor_juros,
          valorTotal: valorTotal
        });
        return total + valorTotal;
      }, 0) || 0;

      console.log('Faturamento Mensalidades:', faturamentoMensalidades);

      // Buscar total de tickets emitidos
      const { count: ticketsEmitidos } = await supabase
        .from('tickets')
        .select('*', { count: 'exact' });

      // Buscar tickets ativos
      const { count: ticketsAtivos } = await supabase
        .from('tickets')
        .select('*', { count: 'exact' })
        .eq('status', 'ABERTO');

      // Buscar mensalidades em atraso
      const { count: mensalidadesEmAtraso } = await supabase
        .from('mensalidades')
        .select('*', { count: 'exact' })
        .eq('status', 'ATRASADO');

      const faturamentoDiario = faturamentoTicketsAvulsos + faturamentoMensalidades;
      console.log('Faturamento Diário Total:', faturamentoDiario);

      return {
        faturamentoDiario,
        ticketsEmitidos: ticketsEmitidos || 0,
        ticketsAtivos: ticketsAtivos || 0,
        mensalidadesEmAtraso: mensalidadesEmAtraso || 0
      };
    } catch (error: any) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw new Error(error.message || 'Erro ao buscar dados do dashboard');
    }
  },

  // Buscar dados de faturamento mensal
  buscarFaturamentoMensal: async (): Promise<DadosFaturamento[]> => {
    try {
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const anoAtual = new Date().getFullYear();
      const dadosFaturamento: DadosFaturamento[] = [];

      // Para cada mês do ano atual
      for (let mes = 0; mes < 12; mes++) {
        const dataInicio = new Date(anoAtual, mes, 1);
        const dataFim = new Date(anoAtual, mes + 1, 0, 23, 59, 59, 999);

        // Converter para UTC mantendo o horário local
        const dataInicioUTC = new Date(dataInicio.getTime() - (dataInicio.getTimezoneOffset() * 60000));
        const dataFimUTC = new Date(dataFim.getTime() - (dataFim.getTimezoneOffset() * 60000));

        console.log(`Buscando dados para ${meses[mes]}:`, {
          inicio: dataInicioUTC.toISOString(),
          fim: dataFimUTC.toISOString()
        });

        // Buscar tickets avulsos fechados do mês
        const { data: ticketsMes, error: errorTickets } = await supabase
          .from('tickets')
          .select('valor_total')
          .eq('status', 'FECHADO')
          .eq('tipo', 'AVULSO')
          .gte('hora_saida', dataInicioUTC.toISOString())
          .lte('hora_saida', dataFimUTC.toISOString());

        if (errorTickets) {
          console.error(`Erro ao buscar tickets para ${meses[mes]}:`, errorTickets);
          continue;
        }

        console.log(`Tickets encontrados em ${meses[mes]}:`, ticketsMes?.length || 0);

        // Buscar mensalidades pagas no mês
        const { data: mensalidadesMes } = await supabase
          .from('mensalidades')
          .select('valor, valor_multa, valor_juros')
          .eq('status', 'PAGO')
          .gte('data_pagamento', dataInicio.toISOString().split('T')[0])
          .lte('data_pagamento', dataFim.toISOString().split('T')[0]);

        // Calcular valor total do mês
        const valorTickets = ticketsMes?.reduce((total, ticket) => total + (ticket.valor_total || 0), 0) || 0;
        const valorMensalidades = mensalidadesMes?.reduce((total, mensalidade) => {
          const valorBase = mensalidade.valor || 0;
          const valorMulta = mensalidade.valor_multa || 0;
          const valorJuros = mensalidade.valor_juros || 0;
          return total + valorBase + valorMulta + valorJuros;
        }, 0) || 0;

        const valorTotal = valorTickets + valorMensalidades;

        dadosFaturamento.push({
          nome: meses[mes],
          valor: valorTotal
        });
      }

      return dadosFaturamento;
    } catch (error) {
      console.error('Erro ao buscar faturamento mensal:', error);
      throw error;
    }
  },

  // Buscar distribuição de tickets
  buscarDistribuicaoTickets: async (): Promise<DadosTickets[]> => {
    try {
      // Buscar total de tickets avulsos
      const { count: totalAvulsos } = await supabase
        .from('tickets')
        .select('*', { count: 'exact' })
        .not('placa', 'ilike', 'AAA%');

      // Buscar total de tickets mensalistas
      const { count: totalMensalistas } = await supabase
        .from('tickets')
        .select('*', { count: 'exact' })
        .ilike('placa', 'AAA%');

      // Buscar total de tickets de eventos (implementar lógica específica se necessário)
      const totalEventos = 0; // Por enquanto zero, implementar conforme regra de negócio

      return [
        { nome: 'Avulsos', valor: totalAvulsos || 0 },
        { nome: 'Mensalistas', valor: totalMensalistas || 0 },
        { nome: 'Eventos', valor: totalEventos }
      ];
    } catch (error) {
      console.error('Erro ao buscar distribuição de tickets:', error);
      throw error;
    }
  },

  // Buscar dados de ocupação
  buscarDadosOcupacao: async (): Promise<DadosOcupacao[]> => {
    try {
      // Buscar total de vagas ocupadas
      const { count: vagasOcupadas } = await supabase
        .from('vagas')
        .select('*', { count: 'exact' })
        .eq('status', 'OCUPADA');

      // Buscar total de vagas
      const { count: totalVagas } = await supabase
        .from('vagas')
        .select('*', { count: 'exact' });

      const vagasLivres = (totalVagas || 0) - (vagasOcupadas || 0);

      return [
        { nome: 'Ocupadas', valor: vagasOcupadas || 0 },
        { nome: 'Livres', valor: vagasLivres }
      ];
    } catch (error) {
      console.error('Erro ao buscar dados de ocupação:', error);
      throw error;
    }
  },

  gerarRelatorioPDF: async (dataInicio: string, dataFim: string): Promise<string> => {
    try {
      // Buscar dados do período
      const { data: ticketsFechados } = await supabase
        .from('tickets')
        .select(`
          *,
          vaga:vagas (
            numero,
            categoria:categorias (nome)
          )
        `)
        .eq('status', 'FECHADO')
        .gte('hora_saida', dataInicio)
        .lte('hora_saida', dataFim);

      const { data: mensalidadesPagas } = await supabase
        .from('mensalidades')
        .select(`
          *,
          mensalista:mensalistas (
            nome,
            cpf
          )
        `)
        .eq('status', 'PAGO')
        .gte('data_pagamento', dataInicio.split('T')[0])
        .lte('data_pagamento', dataFim.split('T')[0]);

      // Calcular totais
      const totalTickets = ticketsFechados?.reduce((sum, ticket) => sum + (ticket.valor_total || 0), 0) || 0;
      const totalMensalidades = mensalidadesPagas?.reduce((sum, mensalidade) => {
        const valorBase = mensalidade.valor || 0;
        const valorMulta = mensalidade.valor_multa || 0;
        const valorJuros = mensalidade.valor_juros || 0;
        const valorTotal = valorBase + valorMulta + valorJuros;
        return sum + valorTotal;
      }, 0) || 0;
      const totalGeral = totalTickets + totalMensalidades;

      // Criar PDF
      const doc = new jsPDF();
      const dataRelatorio = new Date().toLocaleDateString('pt-BR');
      
      // Cabeçalho
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text('Relatório Financeiro Detalhado', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
      doc.text(`Data de emissão: ${dataRelatorio}`, 105, 37, { align: 'center' });

      let yPos = 45;

      // Resumo Financeiro
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('1. Resumo Financeiro', 14, yPos);
      
      yPos += 10;

      const dadosResumo = [
        ['Total de Tickets', ticketsFechados?.length?.toString() || '0', totalTickets.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
        ['Total de Mensalidades', mensalidadesPagas?.length?.toString() || '0', totalMensalidades.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
        ['Total Geral', '-', totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Quantidade', 'Valor Total']],
        body: dadosResumo,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 70, halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;

      // Detalhamento de Mensalidades
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('2. Detalhamento de Mensalidades', 14, yPos);

      yPos += 10;

      const dadosMensalidades = mensalidadesPagas?.map(mensalidade => {
        const valorBase = mensalidade.valor || 0;
        const valorMulta = mensalidade.valor_multa || 0;
        const valorJuros = mensalidade.valor_juros || 0;
        const valorTotal = valorBase + valorMulta + valorJuros;

        return [
          new Date(mensalidade.data_pagamento!).toLocaleDateString('pt-BR'),
          mensalidade.mensalista?.nome || '-',
          mensalidade.mensalista?.cpf || '-',
          valorBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          valorMulta > 0 ? valorMulta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
          valorJuros > 0 ? valorJuros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
          valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ];
      }) || [];

      autoTable(doc, {
        startY: yPos,
        head: [['Data Pagamento', 'Mensalista', 'CPF', 'Valor Base', 'Multa', 'Juros', 'Total']],
        body: dadosMensalidades,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 11 },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;

      // Análise por Categoria
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('3. Análise por Categoria de Veículo', 14, yPos);

      yPos += 10;

      // Agrupar tickets por categoria
      const categorias = ticketsFechados?.reduce((acc: any, ticket) => {
        const categoria = ticket.vaga?.categoria?.nome || 'Sem categoria';
        if (!acc[categoria]) {
          acc[categoria] = { quantidade: 0, valor: 0 };
        }
        acc[categoria].quantidade++;
        acc[categoria].valor += ticket.valor_total || 0;
        return acc;
      }, {});

      const dadosCategorias = Object.entries(categorias || {}).map(([categoria, dados]: [string, any]) => [
        categoria,
        dados.quantidade.toString(),
        dados.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Categoria', 'Quantidade', 'Valor Total']],
        body: dadosCategorias,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 12 },
        styles: { fontSize: 11, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 70, halign: 'right' }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;

      // Detalhamento de Tickets
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('4. Detalhamento de Tickets', 14, yPos);

      yPos += 10;

      const dadosTickets = ticketsFechados?.map(ticket => {
        const entrada = new Date(ticket.hora_entrada);
        const saida = new Date(ticket.hora_saida!);
        const diff = Math.ceil((saida.getTime() - entrada.getTime()) / (1000 * 60 * 60)); // Horas

        return [
          ticket.vaga?.numero || '-',
          ticket.placa,
          entrada.toLocaleString('pt-BR'),
          saida.toLocaleString('pt-BR'),
          `${diff}h`,
          ticket.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'
        ];
      }) || [];

      autoTable(doc, {
        startY: yPos,
        head: [['Vaga', 'Placa', 'Entrada', 'Saída', 'Tempo', 'Valor']],
        body: dadosTickets,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 11 },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          5: { halign: 'right' }
        }
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          'ParkSystem Pro - Relatório Financeiro',
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Gerar base64 do PDF
      const pdfBase64 = doc.output('datauristring');
      return pdfBase64;

    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
      throw error;
    }
  }
}; 