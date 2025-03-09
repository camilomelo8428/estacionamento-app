import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ticketsService } from '../../services/ticketsService';
import { useVagas } from '../../contexts/VagasContext';
import { useError } from '../../contexts/ErrorContext';
import { mensalistasService } from '../../services/mensalistasService';
import RemoverTicketModal from './RemoverTicketModal';
import './styles.css';

interface DetalhesTicketProps {
  onClose: () => void;
  getTicketDetalhes: () => Promise<{
    id?: string;
    status: string;
    entrada: string;
    veiculo: {
      modelo: string;
      placa: string;
    };
    categoria: string;
    vaga: string;
    vaga_id?: string;
    cliente: string;
    tipo: string;
    modalidade: string;
    tempoDecorrido: string;
    valorEstacionamento: number;
    valorTotal: number;
    metodoPagamento: string;
    observacoes: string;
  } | null>;
}

interface NovoVeiculoModalProps {
  mensalistaId: string;
  onClose: () => void;
  onSave: () => void;
}

const NovoVeiculoModal: React.FC<NovoVeiculoModalProps> = ({ mensalistaId, onClose, onSave }) => {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    cor: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.placa || !formData.modelo || !formData.cor) {
        throw new Error('Todos os campos são obrigatórios');
      }

      await mensalistasService.adicionarVeiculo({
        mensalista_id: mensalistaId,
        placa: formData.placa,
        modelo: formData.modelo,
        cor: formData.cor
      });

      onSave();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar veículo');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal novo-veiculo-modal">
        <div className="modal-header">
          <h2>Adicionar Novo Veículo</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="form-veiculo">
            <div className="form-group">
              <label htmlFor="placa">Placa</label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                placeholder="ABC1234"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="modelo">Modelo</label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Ex: Fiat Uno"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cor">Cor</label>
              <input
                type="text"
                id="cor"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
                placeholder="Ex: Branco"
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DetalhesTicket: React.FC<DetalhesTicketProps> = ({ getTicketDetalhes, onClose }) => {
  const { liberarVaga, listarVagas } = useVagas();
  const { setError } = useError();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [showNovoVeiculoModal, setShowNovoVeiculoModal] = useState(false);
  const [showRemoverModal, setShowRemoverModal] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      const ticketData = await getTicketDetalhes();
      if (ticketData) {
        setTicket(ticketData);
      } else {
        onClose();
      }
    };
    loadTicket();
  }, [getTicketDetalhes, onClose]);

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleEncerrarTicket = async () => {
    if (!ticket?.id || !ticket?.vaga_id) {
      setError('Informações do ticket incompletas');
      return;
    }

    setLoading(true);
    try {
      await ticketsService.encerrarTicket(ticket.id);
      await listarVagas();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao encerrar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPDF = () => {
    if (!ticket) return;

    const conteudo = `
      TICKET DE ESTACIONAMENTO
      -----------------------
      
      Status: ${ticket.status}
      Entrada: ${formatarData(ticket.entrada)}
      Veículo: ${ticket.veiculo.modelo} | ${ticket.veiculo.placa}
      Categoria: ${ticket.categoria}
      Vaga: ${ticket.vaga}
      Cliente: ${ticket.cliente}
      Tipo: ${ticket.tipo}
      Modalidade: ${ticket.modalidade}
      Tempo decorrido: ${ticket.tempoDecorrido}
      Valor estacionamento: ${formatarValor(ticket.valorEstacionamento)}
      Valor total: ${formatarValor(ticket.valorTotal)}
      Método pagamento: ${ticket.metodoPagamento}
      Observações: ${ticket.observacoes || 'Sem observações'}
    `;

    // Criar um Blob com o conteúdo
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    
    // Criar URL para download
    const url = window.URL.createObjectURL(blob);
    
    // Criar link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${ticket.veiculo.placa}_${format(new Date(ticket.entrada), 'yyyyMMdd_HHmmss')}.txt`;
    
    // Adicionar link ao documento e clicar
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!ticket) return null;

  return (
    <div className="modal-overlay">
      <div className="modal detalhes-ticket-modal">
        <div className="modal-header">
          <h2>Detalhes Do Ticket</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="ticket-status">
            <span className={`status-badge ${ticket.status.toLowerCase()}`}>
              {ticket.status}
            </span>
          </div>

          <div className="ticket-info-grid">
            <div className="info-section">
              <h3>Informações do Veículo</h3>
              <div className="info-row">
                <span className="info-label">Placa:</span>
                <span className="info-value">{ticket.veiculo.placa}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Modelo:</span>
                <span className="info-value">{ticket.veiculo.modelo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Categoria:</span>
                <span className="info-value">{ticket.categoria}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vaga:</span>
                <span className="info-value">{ticket.vaga}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Informações do Cliente</h3>
              <div className="info-row">
                <span className="info-label">Cliente:</span>
                <span className="info-value">{ticket.cliente}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{ticket.tipo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Modalidade:</span>
                <span className="info-value">{ticket.modalidade}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Informações de Tempo e Valor</h3>
              <div className="info-row">
                <span className="info-label">Entrada:</span>
                <span className="info-value">{formatarData(ticket.entrada)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Tempo decorrido:</span>
                <span className="info-value">{ticket.tempoDecorrido}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Valor estacionamento:</span>
                <span className="info-value">{formatarValor(ticket.valorEstacionamento)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Valor total:</span>
                <span className="info-value valor-total">{formatarValor(ticket.valorTotal)}</span>
              </div>
            </div>

            <div className="info-section">
              <h3>Informações Adicionais</h3>
              <div className="info-row">
                <span className="info-label">Método de pagamento:</span>
                <span className="info-value">{ticket.metodoPagamento}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Observações:</span>
                <span className="info-value">{ticket.observacoes || 'Sem observações'}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            {ticket?.status === 'ABERTO' ? (
              <>
                <button 
                  className="btn-encerrar"
                  onClick={handleEncerrarTicket}
                  disabled={loading}
                >
                  {loading ? 'Encerrando...' : 'Encerrar ticket'}
                </button>
                <button 
                  className="btn-remover"
                  onClick={() => setShowRemoverModal(true)}
                >
                  Remover Ticket
                </button>
              </>
            ) : (
              <button 
                className="btn-remover"
                onClick={() => setShowRemoverModal(true)}
              >
                Remover Ticket
              </button>
            )}
            <button 
              className="btn-pdf"
              onClick={handleGerarPDF}
            >
              Gerar PDF
            </button>
          </div>

          <div className="veiculos-section">
            <div className="veiculos-header">
              <h3>Veículos do Cliente</h3>
              <button 
                className="btn-add-veiculo" 
                onClick={() => setShowNovoVeiculoModal(true)}
              >
                Adicionar Veículo
              </button>
            </div>
          </div>
        </div>
      </div>

      {showNovoVeiculoModal && (
        <NovoVeiculoModal
          mensalistaId={ticket.cliente}
          onClose={() => setShowNovoVeiculoModal(false)}
          onSave={async () => {
            await getTicketDetalhes();
          }}
        />
      )}

      {showRemoverModal && ticket?.id && ticket?.vaga_id && (
        <RemoverTicketModal
          ticketId={ticket.id}
          vagaId={ticket.vaga_id}
          onClose={() => setShowRemoverModal(false)}
          onSuccess={() => {
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default DetalhesTicket; 