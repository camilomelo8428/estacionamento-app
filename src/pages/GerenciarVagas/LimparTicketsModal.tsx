import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../services/supabase';
import { useVagas } from '../../contexts/VagasContext';
import './styles.css';

interface Ticket {
  id: string;
  placa: string;
  modelo: string;
  tipo: 'AVULSO' | 'MENSALISTA';
  status: 'ABERTO' | 'FECHADO';
  hora_entrada: string;
  hora_saida?: string;
  mensalista?: {
    nome: string;
  };
}

interface LimparTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LimparTicketsModal: React.FC<LimparTicketsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { listarVagas } = useVagas();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ABERTO' | 'FECHADO'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'AVULSO' | 'MENSALISTA'>('TODOS');
  const [senha, setSenha] = useState('');
  const [senhaVerificada, setSenhaVerificada] = useState(false);
  const [erroSenha, setErroSenha] = useState('');

  const SENHA_ADMIN = '071012';

  useEffect(() => {
    if (isOpen && senhaVerificada) {
      carregarTickets();
    }
  }, [isOpen, senhaVerificada]);

  const verificarSenha = () => {
    if (senha === SENHA_ADMIN) {
      setSenhaVerificada(true);
      setErroSenha('');
    } else {
      setErroSenha('Senha incorreta. Tente novamente.');
      setSenha('');
    }
  };

  const carregarTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          placa,
          modelo,
          tipo,
          status,
          hora_entrada,
          hora_saida,
          mensalista:mensalistas (
            nome
          )
        `);

      if (error) throw error;

      // Transformar os dados para o formato correto
      const ticketsFormatados: Ticket[] = (data || []).map(ticket => ({
        id: ticket.id,
        placa: ticket.placa,
        modelo: ticket.modelo,
        tipo: ticket.tipo,
        status: ticket.status,
        hora_entrada: ticket.hora_entrada,
        hora_saida: ticket.hora_saida,
        mensalista: ticket.mensalista ? {
          nome: ticket.mensalista[0]?.nome || ''
        } : undefined
      }));

      setTickets(ticketsFormatados);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleSelecionarTodos = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(ticket => ticket.id));
    }
  };

  const handleSelecionarTicket = (ticketId: string) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleRemoverSelecionados = async () => {
    if (!selectedTickets.length) {
      toast.warn('Selecione pelo menos um ticket para remover');
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover os tickets selecionados?')) {
      return;
    }

    setLoading(true);
    try {
      // Primeiro buscar os tickets para obter os vaga_ids
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          vaga_id,
          vaga:vagas (
            categoria_id
          )
        `)
        .in('id', selectedTickets);

      if (ticketsError) throw ticketsError;

      // Remover os tickets
      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .in('id', selectedTickets);

      if (deleteError) throw deleteError;

      // Atualizar o status das vagas para LIVRE
      if (ticketsData && ticketsData.length > 0) {
        const vagaIds = ticketsData.map(t => t.vaga_id).filter(Boolean);
        if (vagaIds.length > 0) {
          // Atualizar uma vaga por vez para evitar problemas com o limite por categoria
          for (const vagaId of vagaIds) {
            const { error: vagaError } = await supabase
              .from('vagas')
              .update({
                status: 'LIVRE',
                placa: null,
                hora_entrada: null,
                hora_saida: null,
                valor_cobrado: null
              })
              .eq('id', vagaId);

            if (vagaError) {
              console.error('Erro ao atualizar vaga:', vagaError);
              continue; // Continua com a próxima vaga mesmo se houver erro
            }
          }
        }
      }

      toast.success('Tickets removidos com sucesso!');
      await listarVagas(); // Atualiza a lista de vagas
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao remover tickets:', error);
      if (error?.message?.includes('P0001')) {
        toast.error('Erro ao atualizar algumas vagas. Por favor, verifique a configuração das categorias.');
      } else {
        toast.error('Erro ao remover tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const ticketsFiltrados = tickets.filter(ticket => {
    const matchStatus = filtroStatus === 'TODOS' || ticket.status === filtroStatus;
    const matchTipo = filtroTipo === 'TODOS' || ticket.tipo === filtroTipo;
    return matchStatus && matchTipo;
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal limpar-tickets-modal">
        <div className="modal-header">
          <h2>Limpar Tickets</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {!senhaVerificada ? (
          <div className="modal-content">
            <div className="senha-container">
              <h3>Digite a senha de administrador</h3>
              <div className="form-group">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha"
                  className={erroSenha ? 'error' : ''}
                />
                {erroSenha && <div className="erro-senha">{erroSenha}</div>}
              </div>
              <button className="btn-confirmar" onClick={verificarSenha}>
                Verificar Senha
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-content">
            <div className="filtros-tickets">
              <div className="filtro-grupo">
                <label>Status:</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as any)}>
                  <option value="TODOS">Todos</option>
                  <option value="ABERTO">Abertos</option>
                  <option value="FECHADO">Fechados</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <label>Tipo:</label>
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as any)}>
                  <option value="TODOS">Todos</option>
                  <option value="AVULSO">Avulso</option>
                  <option value="MENSALISTA">Mensalista</option>
                </select>
              </div>
            </div>

            <div className="tickets-header">
              <label>
                <input
                  type="checkbox"
                  checked={selectedTickets.length === tickets.length}
                  onChange={handleSelecionarTodos}
                />
                Selecionar Todos
              </label>
            </div>

            <div className="tickets-lista">
              {loading ? (
                <div className="loading">Carregando tickets...</div>
              ) : ticketsFiltrados.length === 0 ? (
                <div className="no-tickets">Nenhum ticket encontrado</div>
              ) : (
                ticketsFiltrados.map(ticket => (
                  <div key={ticket.id} className={`ticket-item ${ticket.status.toLowerCase()}`}>
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => handleSelecionarTicket(ticket.id)}
                    />
                    <div className="ticket-info">
                      <div className="ticket-principal">
                        <span className="placa">{ticket.placa}</span>
                        <span className={`status ${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                        <span className={`tipo ${ticket.tipo.toLowerCase()}`}>
                          {ticket.tipo}
                        </span>
                      </div>
                      {ticket.tipo === 'MENSALISTA' && ticket.mensalista && (
                        <div className="mensalista">
                          👤 {ticket.mensalista.nome}
                        </div>
                      )}
                      <div className="ticket-detalhes">
                        <span>Modelo: {ticket.modelo}</span>
                        <span>Entrada: {formatarData(ticket.hora_entrada)}</span>
                        {ticket.hora_saida && (
                          <span>Saída: {formatarData(ticket.hora_saida)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {ticketsFiltrados.length > 0 && (
              <div className="modal-actions">
                <button
                  className="btn-remover"
                  onClick={handleRemoverSelecionados}
                  disabled={selectedTickets.length === 0 || loading}
                >
                  Remover Selecionados
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LimparTicketsModal; 