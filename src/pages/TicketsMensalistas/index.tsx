import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../services/ticketsService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useError } from '../../contexts/ErrorContext';
import { toast } from 'react-toastify';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './styles.css';

const TicketsMensalistas: React.FC = () => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ABERTOS' | 'FECHADOS'>('TODOS');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketsService.listarTicketsMensalistas();
        if (isMounted && response.success) {
          setTickets(response.data);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message || 'Erro ao carregar tickets');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      isMounted = false;
    };
  }, [setError]);

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleEncerrarTicket = async (ticketId: string) => {
    try {
      const response = await ticketsService.encerrarTicket(ticketId);
      if (response.success) {
        toast.success('Ticket encerrado com sucesso!');
        const ticketsResponse = await ticketsService.listarTicketsMensalistas();
        if (ticketsResponse.success) {
          setTickets(ticketsResponse.data);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao encerrar ticket');
    }
  };

  const handleVisualizarDetalhes = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowDetalhesModal(true);
  };

  const ticketsFiltrados = tickets.filter(ticket => {
    if (filtroStatus === 'TODOS') return true;
    if (filtroStatus === 'ABERTOS') return ticket.status === 'ABERTO';
    return ticket.status === 'FECHADO';
  });

  return (
    <div className="tickets-mensalistas-container">
      <div className="tickets-header">
        <h1>Tickets de Mensalistas</h1>
        <div className="filtros">
          <div className="filtro-status">
            <button
              className={filtroStatus === 'TODOS' ? 'active' : ''}
              onClick={() => setFiltroStatus('TODOS')}
            >
              Todos
            </button>
            <button
              className={filtroStatus === 'ABERTOS' ? 'active' : ''}
              onClick={() => setFiltroStatus('ABERTOS')}
            >
              Abertos
            </button>
            <button
              className={filtroStatus === 'FECHADOS' ? 'active' : ''}
              onClick={() => setFiltroStatus('FECHADOS')}
            >
              Fechados
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando tickets...</div>
      ) : ticketsFiltrados.length === 0 ? (
        <div className="no-tickets">Nenhum ticket encontrado</div>
      ) : (
        <div className="tickets-grid">
          {ticketsFiltrados.map(ticket => (
            <div key={ticket.id} className={`ticket-card ${ticket.status.toLowerCase()}`}>
              <div className="ticket-header">
                <h3>Ticket #{ticket.id.slice(-4)}</h3>
                <span className={`status ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="ticket-info">
                <p>
                  <strong>Mensalista:</strong> {ticket.mensalista?.nome}
                </p>
                <p>
                  <strong>Veículo:</strong> {ticket.veiculo?.modelo} - {ticket.veiculo?.placa}
                </p>
                <p>
                  <strong>Entrada:</strong> {formatarData(ticket.hora_entrada)}
                </p>
                {ticket.hora_saida && (
                  <p>
                    <strong>Saída:</strong> {formatarData(ticket.hora_saida)}
                  </p>
                )}
              </div>
              <div className="ticket-actions">
                <button
                  className="btn-visualizar"
                  onClick={() => handleVisualizarDetalhes(ticket)}
                >
                  <EyeOutlined style={{ color: '#ffffff' }} /> Visualizar
                </button>
                {ticket.status === 'ABERTO' && (
                  <button
                    className="btn-encerrar"
                    onClick={() => handleEncerrarTicket(ticket.id)}
                  >
                    <CloseCircleOutlined style={{ color: '#ffffff' }} /> Encerrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Ticket */}
      {showDetalhesModal && selectedTicket && (
        <div className="modal-overlay">
          <div className="modal detalhes-ticket-modal">
            <div className="modal-header">
              <h2>Detalhes do Ticket #{selectedTicket.id.slice(-4)}</h2>
              <button className="btn-close" onClick={() => setShowDetalhesModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="ticket-status">
                <span className={`status-badge ${selectedTicket.status.toLowerCase()}`}>
                  {selectedTicket.status}
                </span>
              </div>
              <div className="ticket-info-grid">
                <div className="info-section">
                  <h3>Informações do Mensalista</h3>
                  <div className="info-row">
                    <span className="info-label">Nome:</span>
                    <span className="info-value">{selectedTicket.mensalista?.nome}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">CPF:</span>
                    <span className="info-value">{selectedTicket.mensalista?.cpf}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{selectedTicket.mensalista?.telefone}</span>
                  </div>
                </div>
                <div className="info-section">
                  <h3>Informações do Veículo</h3>
                  <div className="info-row">
                    <span className="info-label">Modelo:</span>
                    <span className="info-value">{selectedTicket.veiculo?.modelo}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Placa:</span>
                    <span className="info-value">{selectedTicket.veiculo?.placa}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Cor:</span>
                    <span className="info-value">{selectedTicket.veiculo?.cor}</span>
                  </div>
                </div>
                <div className="info-section">
                  <h3>Informações do Ticket</h3>
                  <div className="info-row">
                    <span className="info-label">Entrada:</span>
                    <span className="info-value">{formatarData(selectedTicket.hora_entrada)}</span>
                  </div>
                  {selectedTicket.hora_saida && (
                    <div className="info-row">
                      <span className="info-label">Saída:</span>
                      <span className="info-value">{formatarData(selectedTicket.hora_saida)}</span>
                    </div>
                  )}
                  {selectedTicket.valor_total && (
                    <div className="info-row">
                      <span className="info-label">Valor Total:</span>
                      <span className="info-value valor-total">
                        {formatarValor(selectedTicket.valor_total)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                {selectedTicket.status === 'ABERTO' && (
                  <button
                    className="btn-encerrar"
                    onClick={() => {
                      handleEncerrarTicket(selectedTicket.id);
                      setShowDetalhesModal(false);
                    }}
                  >
                    <CloseCircleOutlined style={{ color: '#ffffff' }} /> Encerrar Ticket
                  </button>
                )}
                <button
                  className="btn-fechar"
                  onClick={() => setShowDetalhesModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsMensalistas; 