import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../services/ticketsService';
import { Ticket } from '../../types/ticket';
import { useError } from '../../contexts/ErrorContext';
import { toast } from 'react-toastify';
import { imprimirReciboTicket } from '../../utils/printUtils';
import { supabase } from '../../services/supabase';
import './styles.css';
import { useEmpresa } from '../../contexts/EmpresaContext';

interface ModalPagamentoProps {
  ticket: Ticket;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ModalPagamento = ({ ticket, onConfirmar, onCancelar }: ModalPagamentoProps) => {
  const [valorAtual, setValorAtual] = useState(ticket.valor_total);

  useEffect(() => {
    const atualizarValor = async () => {
      try {
        const response = await ticketsService.calcularValorTicket(ticket.id);
        if (response.success) {
          setValorAtual(response.data.valorTotal);
        }
      } catch (error) {
        console.error('Erro ao atualizar valor:', error);
      }
    };

    // Atualizar valor a cada 30 segundos
    const interval = setInterval(atualizarValor, 30000);
    atualizarValor(); // Primeira atualização

    return () => clearInterval(interval);
  }, [ticket.id]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const calcularTempoDecorrido = (horaEntrada: string) => {
    const entrada = new Date(horaEntrada);
    const agora = new Date();
    const diff = agora.getTime() - entrada.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}min`;
  };

  return (
    <div className="pagamento-modal">
      <div className="modal-content">
        <div className="ticket-resumo">
          <h3>Resumo do Ticket</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Placa</span>
              <span className="info-value">{ticket.placa}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Entrada</span>
              <span className="info-value">{formatarData(ticket.hora_entrada)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tempo Total</span>
              <span className="info-value">{calcularTempoDecorrido(ticket.hora_entrada)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Inicial (1ª hora)</span>
              <span className="info-value">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(ticket.valor_total || 0)}
              </span>
            </div>
          </div>
          <div className="valor-total">
            <span className="info-label">Valor a Pagar</span>
            <span className="info-value">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(valorAtual || 0)}
            </span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-confirmar" onClick={onConfirmar}>
            Confirmar Pagamento
          </button>
          <button className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const Tickets: React.FC = () => {
  const { setError } = useError();
  const { dadosEmpresa } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtro, setFiltro] = useState<'ABERTOS' | 'FECHADOS'>('ABERTOS');
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);

  useEffect(() => {
    carregarTickets();
  }, [filtro, dataInicio, dataFim]);

  const calcularTempoDecorrido = (horaEntrada: string, horaSaida?: string) => {
    const entrada = new Date(horaEntrada);
    const saida = horaSaida ? new Date(horaSaida) : new Date();
    const diff = saida.getTime() - entrada.getTime();
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}min`;
  };

  const carregarTickets = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filtro === 'ABERTOS') {
        response = await ticketsService.buscarTicketsAbertos();
      } else {
        response = await ticketsService.buscarTicketsFechados(
          `${dataInicio}T00:00:00Z`,
          `${dataFim}T23:59:59Z`
        );
      }

      setTickets(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const handleFecharTicket = async (ticket: Ticket) => {
    try {
      const response = await ticketsService.calcularValorTicket(ticket.id);
      if (!response.success) {
        throw new Error(response.message);
      }
      setValorTotal(response.data.valorTotal);
      setTicketSelecionado(ticket);
      setShowPagamentoModal(true);
    } catch (error: any) {
      setError(error.message || 'Erro ao calcular valor do ticket');
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!ticketSelecionado || !dadosEmpresa) return;
    
    try {
      const response = await ticketsService.encerrarTicket(ticketSelecionado.id);
      if (response.success && response.data) {
        // Buscar número da vaga
        const { data: vaga } = await supabase
          .from('vagas')
          .select('numero')
          .eq('id', ticketSelecionado.vaga_id)
          .single();

        // Preparar dados para impressão
        const dadosImpressao = {
          placa: ticketSelecionado.placa,
          modelo: ticketSelecionado.modelo || '',
          cor: ticketSelecionado.cor,
          vaga: vaga?.numero || '',
          hora_entrada: ticketSelecionado.hora_entrada,
          hora_saida: new Date().toISOString(),
          valor: valorTotal,
          tempo_total: calcularTempoDecorrido(ticketSelecionado.hora_entrada)
        };

        // Dados da empresa do contexto
        const empresaImpressao = {
          nome: dadosEmpresa.nome,
          endereco: dadosEmpresa.endereco || '',
          telefone: dadosEmpresa.telefone || '',
          cnpj: dadosEmpresa.cnpj
        };

        // Imprimir recibo
        await imprimirReciboTicket(dadosImpressao, empresaImpressao);

        setShowPagamentoModal(false);
        setTicketSelecionado(null);
        toast.success('Ticket encerrado com sucesso!');
        await carregarTickets();
      } else {
        throw new Error(response.message || 'Erro ao encerrar ticket');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao processar pagamento');
    }
  };

  return (
    <div className="tickets-container">
      <div className="tickets-header">
        <h1>Tickets Avulsos</h1>
        
        <div className="filtros">
          <div className="filtro-status">
            <button
              className={filtro === 'ABERTOS' ? 'active' : ''}
              onClick={() => setFiltro('ABERTOS')}
            >
              Tickets Abertos
            </button>
            <button
              className={filtro === 'FECHADOS' ? 'active' : ''}
              onClick={() => setFiltro('FECHADOS')}
            >
              Tickets Fechados
            </button>
          </div>

          {filtro === 'FECHADOS' && (
            <div className="filtro-data">
              <div className="input-group">
                <label>De:</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Até:</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="no-tickets">
          Nenhum ticket {filtro === 'ABERTOS' ? 'aberto' : 'fechado'} encontrado
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className={`ticket-card ${ticket.status.toLowerCase()}`}>
              <div className="ticket-header">
                <h3>Ticket #{ticket.id.slice(-4)}</h3>
                <span className={`status ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>

              <div className="ticket-info">
                <div className="info-row">
                  <span>Placa:</span>
                  <strong>{ticket.placa}</strong>
                </div>
                <div className="info-row">
                  <span>Modelo:</span>
                  <strong>{ticket.modelo}</strong>
                </div>
                <div className="info-row">
                  <span>Cor:</span>
                  <strong>{ticket.cor}</strong>
                </div>
                <div className="info-row">
                  <span>Categoria:</span>
                  <strong>{ticket.categoria}</strong>
                </div>
                <div className="info-row">
                  <span>Entrada:</span>
                  <strong>{formatarData(ticket.hora_entrada)}</strong>
                </div>
                {ticket.hora_saida && (
                  <div className="info-row">
                    <span>Saída:</span>
                    <strong>{formatarData(ticket.hora_saida)}</strong>
                  </div>
                )}
                <div className="info-row">
                  <span>Tempo:</span>
                  <strong>
                    {calcularTempoDecorrido(ticket.hora_entrada, ticket.hora_saida)}
                  </strong>
                </div>
                {ticket.valor_total && (
                  <div className="info-row">
                    <span>Valor:</span>
                    <strong>
                      {ticket.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </strong>
                  </div>
                )}
              </div>

              {ticket.status === 'ABERTO' && (
                <button
                  className="btn-fechar-ticket"
                  onClick={() => handleFecharTicket(ticket)}
                >
                  Fechar Ticket
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showPagamentoModal && ticketSelecionado && (
        <ModalPagamento
          ticket={ticketSelecionado}
          onConfirmar={handleConfirmarPagamento}
          onCancelar={() => {
            setShowPagamentoModal(false);
            setTicketSelecionado(null);
          }}
        />
      )}
    </div>
  );
};

export default Tickets; 