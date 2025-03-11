import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../services/supabase';
import { useVagas } from '../../contexts/VagasContext';
import { LoadingOutlined, LockOutlined, CarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ConfirmacaoModal from '../../components/ConfirmacaoModal';
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
  const [pesquisa, setPesquisa] = useState('');
  const [showConfirmacao, setShowConfirmacao] = useState(false);

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
        `)
        .order('hora_entrada', { ascending: false });

      if (error) throw error;

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
    if (selectedTickets.length === ticketsFiltrados.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(ticketsFiltrados.map(ticket => ticket.id));
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

    setShowConfirmacao(true);
  };

  const confirmarRemocao = async () => {
    setLoading(true);
    try {
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

      const { error: deleteError } = await supabase
        .from('tickets')
        .delete()
        .in('id', selectedTickets);

      if (deleteError) throw deleteError;

      if (ticketsData && ticketsData.length > 0) {
        const vagaIds = ticketsData.map(t => t.vaga_id).filter(Boolean);
        if (vagaIds.length > 0) {
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
              continue;
            }
          }
        }
      }

      toast.success(`${selectedTickets.length} ticket(s) removido(s) com sucesso!`);
      await listarVagas();
      await carregarTickets();
      setSelectedTickets([]);
    } catch (error: any) {
      console.error('Erro ao remover tickets:', error);
      if (error?.message?.includes('P0001')) {
        toast.error('Erro ao atualizar algumas vagas. Verifique a configuração das categorias.');
      } else {
        toast.error('Erro ao remover tickets');
      }
    } finally {
      setLoading(false);
      setShowConfirmacao(false);
    }
  };

  const ticketsFiltrados = tickets.filter(ticket => {
    const matchStatus = filtroStatus === 'TODOS' || ticket.status === filtroStatus;
    const matchTipo = filtroTipo === 'TODOS' || ticket.tipo === filtroTipo;
    const matchPesquisa = pesquisa === '' || 
      ticket.placa.toLowerCase().includes(pesquisa.toLowerCase()) ||
      ticket.modelo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (ticket.mensalista?.nome || '').toLowerCase().includes(pesquisa.toLowerCase());
    return matchStatus && matchTipo && matchPesquisa;
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal limpar-tickets-modal">
          <div className="modal-header">
            <h2>
              <LockOutlined style={{ marginRight: '8px' }} />
              Limpar Tickets
            </h2>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>

          {!senhaVerificada ? (
            <div className="modal-content">
              <div className="senha-container">
                <h3>
                  <LockOutlined style={{ marginRight: '8px' }} />
                  Digite a senha de administrador
                </h3>
                <div className="form-group">
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && verificarSenha()}
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
                <div className="filtro-grupo">
                  <label>Pesquisar:</label>
                  <input
                    type="text"
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    placeholder="Placa, modelo ou nome..."
                  />
                </div>
              </div>

              <div className="tickets-header">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTickets.length === ticketsFiltrados.length && ticketsFiltrados.length > 0}
                    onChange={handleSelecionarTodos}
                    disabled={ticketsFiltrados.length === 0}
                  />
                  Selecionar Todos ({selectedTickets.length} selecionado(s))
                </label>
                <span className="tickets-count">
                  Total: {ticketsFiltrados.length} ticket(s)
                </span>
              </div>

              <div className="tickets-lista">
                {loading ? (
                  <div className="loading">
                    <LoadingOutlined style={{ fontSize: 24, marginRight: 8 }} />
                    Carregando tickets...
                  </div>
                ) : ticketsFiltrados.length === 0 ? (
                  <div className="no-tickets">
                    Nenhum ticket encontrado
                  </div>
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
                          <span className="placa">
                            <CarOutlined style={{ marginRight: 4 }} />
                            {ticket.placa}
                          </span>
                          <span className={`status ${ticket.status.toLowerCase()}`}>
                            {ticket.status === 'ABERTO' ? (
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                            ) : (
                              <CheckCircleOutlined style={{ marginRight: 4 }} />
                            )}
                            {ticket.status}
                          </span>
                          <span className={`tipo ${ticket.tipo.toLowerCase()}`}>
                            {ticket.tipo === 'MENSALISTA' ? (
                              <UserOutlined style={{ marginRight: 4 }} />
                            ) : (
                              <CarOutlined style={{ marginRight: 4 }} />
                            )}
                            {ticket.tipo}
                          </span>
                        </div>
                        {ticket.tipo === 'MENSALISTA' && ticket.mensalista && (
                          <div className="mensalista">
                            <UserOutlined style={{ marginRight: 4 }} />
                            {ticket.mensalista.nome}
                          </div>
                        )}
                        <div className="ticket-detalhes">
                          <span>
                            <CarOutlined style={{ marginRight: 4 }} />
                            Modelo: {ticket.modelo}
                          </span>
                          <span>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            Entrada: {formatarData(ticket.hora_entrada)}
                          </span>
                          {ticket.hora_saida && (
                            <span>
                              <CheckCircleOutlined style={{ marginRight: 4 }} />
                              Saída: {formatarData(ticket.hora_saida)}
                            </span>
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
                    {loading ? (
                      <>
                        <LoadingOutlined style={{ marginRight: 8 }} />
                        Removendo...
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined style={{ marginRight: 8 }} />
                        Remover Selecionados
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmacaoModal
        isOpen={showConfirmacao}
        titulo="Confirmar Remoção"
        mensagem={`Tem certeza que deseja remover ${selectedTickets.length} ticket(s)? Esta ação não pode ser desfeita.`}
        tipo="aviso"
        textoBotaoConfirmar="Remover"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarRemocao}
        onCancelar={() => setShowConfirmacao(false)}
      />
    </>
  );
};

export default LimparTicketsModal; 