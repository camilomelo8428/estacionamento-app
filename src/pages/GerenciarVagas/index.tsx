import React, { useEffect, useState } from 'react';
import { useVagas } from '../../contexts/VagasContext';
import { useError } from '../../contexts/ErrorContext';
import { ticketsService } from '../../services/ticketsService';
import { mensalistasService } from '../../services/mensalistasService';
import { TicketRequest } from '../../types/ticket';
import { supabase } from '../../services/supabase';
import TicketMensalista from './TicketMensalista';
import TicketAvulso from './TicketAvulso';
import DetalhesTicket from './DetalhesTicket';
import SelecaoTipoTicket from './SelecaoTipoTicket';
import LimparTicketsModal from './LimparTicketsModal';
import ConfiguracaoVagas from './ConfiguracaoVagas';
import { toast } from 'react-toastify';
import './styles.css';

interface VagasPorCategoria {
  pequenos: string[];
  grandes: string[];
  especiais: string[];
  motos: string[];
}

interface Categoria {
  id: string;
  nome: string;
  vagas: number;
}

type ModalType = 'SELECAO' | 'MENSALISTA' | 'AVULSO' | 'DETALHES' | null;

const GerenciarVagas: React.FC = () => {
  const { vagas, loading, error, listarVagas, ocuparVaga } = useVagas();
  const [vagaSelecionada, setVagaSelecionada] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const { setError } = useError();
  const [modalAberto, setModalAberto] = useState(false);
  const [modalLimparTicketsAberto, setModalLimparTicketsAberto] = useState(false);
  const [modalConfiguracaoAberto, setModalConfiguracaoAberto] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [vagasPorCategoria, setVagasPorCategoria] = useState<VagasPorCategoria>({
    pequenos: [],
    grandes: [],
    especiais: [],
    motos: []
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0) {
      const novasVagas: VagasPorCategoria = {
        pequenos: [],
        grandes: [],
        especiais: [],
        motos: []
      };

      categorias.forEach(categoria => {
        const prefixo = categoria.nome.includes('pequenos') ? 'P' :
                       categoria.nome.includes('Grandes') ? 'G' :
                       categoria.nome.includes('especiais') ? 'E' : 'M';
        
        const array = Array.from({ length: categoria.vagas }, (_, i) => `${prefixo}${i + 1}`);
        
        if (categoria.nome.includes('pequenos')) {
          novasVagas.pequenos = array;
        } else if (categoria.nome.includes('Grandes')) {
          novasVagas.grandes = array;
        } else if (categoria.nome.includes('especiais')) {
          novasVagas.especiais = array;
        } else {
          novasVagas.motos = array;
        }
      });

      setVagasPorCategoria(novasVagas);
      listarVagas();
    }
  }, [categorias, listarVagas]);

  const carregarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome, vagas')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    console.log('Iniciando carregamento de vagas...');
    listarVagas()
      .then(() => {
        console.log('Vagas carregadas com sucesso:', vagas);
      })
      .catch(error => {
        console.error('Erro ao carregar vagas:', error);
      });
  }, [listarVagas]);

  const handleVagaClick = (numero: string) => {
    const vaga = vagas.find(v => v.numero === numero);
    setVagaSelecionada(numero);
    
    if (vaga?.status === 'OCUPADA') {
      setModalType('DETALHES');
    } else {
      setModalType('SELECAO');
    }
  };

  const handleSelectAvulso = () => {
    setModalType('AVULSO');
  };

  const handleSelectMensalista = () => {
    setModalType('MENSALISTA');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setVagaSelecionada(null);
  };

  const handleSaveTicketMensalista = async (data: any) => {
    try {
      if (!data.mensalista_id) {
        throw new Error('Mensalista não selecionado');
      }

      const vaga = vagas.find(v => v.numero === data.numeroVaga);
      if (!vaga || !vaga.id) {
        throw new Error('Vaga não encontrada');
      }

      const categoria = data.numeroVaga.startsWith('P') ? 'PEQUENO' :
                       data.numeroVaga.startsWith('G') ? 'GRANDE' :
                       data.numeroVaga.startsWith('E') ? 'ESPECIAL' : 'MOTO';

      const ticket: TicketRequest = {
        placa: data.placa,
        modelo: data.modelo,
        cor: 'N/A',
        categoria,
        tipo: 'MENSALISTA',
        mensalista_id: data.mensalista_id,
        vaga_id: vaga.id
      };

      const response = await ticketsService.criarTicket(ticket);
      if (!response.success) {
        throw new Error(response.message);
      }

      await listarVagas();
      setModalType(null);
      toast.success('Ticket mensalista criado com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar ticket mensalista');
      console.error('Erro ao criar ticket mensalista:', error);
    }
  };

  const handleSaveTicketAvulso = async (data: any) => {
    try {
      const vaga = vagas.find(v => v.numero === data.numeroVaga);
      if (!vaga || !vaga.id) {
        throw new Error('Vaga não encontrada');
      }

      const ticketData: TicketRequest = {
        vaga_id: vaga.id,
        placa: data.placa,
        modelo: data.modelo,
        cor: data.cor,
        categoria: data.categoria,
        tipo: 'AVULSO'
      };

      const ticketResponse = await ticketsService.criarTicket(ticketData);
      if (!ticketResponse.success) {
        throw new Error('Erro ao criar ticket');
      }

      await listarVagas();
      handleCloseModal();
      toast.success('Ticket avulso criado com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar ticket avulso');
    }
  };

  const getTicketDetalhes = async (numero: string) => {
    try {
      const vaga = vagas.find(v => v.numero === numero);
      if (!vaga) {
        throw new Error('Vaga não encontrada');
      }

      const tickets = await ticketsService.buscarTicketsAbertos();
      const ticket = tickets.data.find(t => t.vaga_id === vaga.id);

      if (!ticket) {
        throw new Error('Ticket não encontrado para esta vaga');
      }

      return {
        id: ticket.id,
        status: vaga.status === 'OCUPADA' ? 'ABERTO' : 'LIVRE',
        entrada: ticket.hora_entrada,
        veiculo: {
          modelo: ticket.modelo,
          placa: ticket.placa
        },
        categoria: numero.startsWith('P') ? 'Veículos pequenos' :
                  numero.startsWith('G') ? 'Veículos grandes' :
                  numero.startsWith('E') ? 'Vagas especiais' :
                  'Motos',
        vaga: numero,
        vaga_id: vaga.id,
        cliente: 'Não informado',
        tipo: ticket.tipo,
        modalidade: ticket.tipo === 'MENSALISTA' ? 'Mensalista' : 'Avulso',
        tempoDecorrido: '0 horas e 0 minutos',
        valorEstacionamento: vaga.valor_cobrado || 0,
        valorTotal: vaga.valor_cobrado || 10,
        metodoPagamento: vaga.status === 'OCUPADA' ? 'Aberto' : 'Não se aplica',
        observacoes: 'Sem observações'
      };
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar detalhes do ticket');
      return null;
    }
  };

  const calcularEstatisticas = () => {
    const total = vagasPorCategoria.pequenos.length + 
                  vagasPorCategoria.grandes.length + 
                  vagasPorCategoria.especiais.length + 
                  vagasPorCategoria.motos.length;
    const ocupadas = vagas.filter(vaga => vaga.status === 'OCUPADA').length;
    const livres = total - ocupadas;
    const ocupacaoPercentual = total > 0 ? (ocupadas / total) * 100 : 0;

    return { total, ocupadas, livres, ocupacaoPercentual };
  };

  const renderVaga = (numero: string) => {
    const vaga = vagas.find(v => v.numero === numero);
    
    let vagaClasses = 'vaga-button livre';
    if (vaga?.status === 'OCUPADA') {
      vagaClasses = 'vaga-button';
      if (vaga.tipo === 'MENSALISTA') {
        vagaClasses += ' mensalista';
      } else {
        vagaClasses += ' ocupada';
      }
    }

    return (
      <button
        key={numero}
        className={vagaClasses}
        onClick={() => handleVagaClick(numero)}
      >
        {numero}
        {vaga?.status === 'OCUPADA' && (
          <>
            <div className="placa">{vaga.placa}</div>
            {vaga.tipo === 'MENSALISTA' ? (
              <span className="mensalista-label">Mensalista</span>
            ) : (
              <span className="avulso-label">Avulso</span>
            )}
          </>
        )}
      </button>
    );
  };

  const handleLimparTickets = async () => {
    try {
      const response = await ticketsService.buscarTicketsAbertos();
      if (response.success && response.data.length > 0) {
        for (const ticket of response.data) {
          await ticketsService.removerTicket(ticket.id);
        }
        await listarVagas();
        toast.success('Tickets removidos com sucesso!');
      } else {
        toast.info('Não há tickets para remover');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao limpar tickets');
    }
  };

  const renderModal = () => {
    if (!vagaSelecionada) return null;

    switch (modalType) {
      case 'SELECAO':
        return (
          <SelecaoTipoTicket
            onClose={handleCloseModal}
            onSelectAvulso={handleSelectAvulso}
            onSelectMensalista={handleSelectMensalista}
          />
        );
      case 'MENSALISTA':
        return (
          <TicketMensalista
            numeroVaga={vagaSelecionada}
            onClose={handleCloseModal}
            onSave={handleSaveTicketMensalista}
          />
        );
      case 'AVULSO':
        return (
          <TicketAvulso
            numeroVaga={vagaSelecionada}
            onClose={handleCloseModal}
            onSave={handleSaveTicketAvulso}
          />
        );
      case 'DETALHES':
        return (
          <DetalhesTicket
            onClose={handleCloseModal}
            getTicketDetalhes={() => getTicketDetalhes(vagaSelecionada)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  const { total, ocupadas, livres, ocupacaoPercentual } = calcularEstatisticas();

  return (
    <div className="gerenciar-container">
      <div className="gerenciar-header">
        <div className="header-content">
          <h1>Disposição Das Vagas</h1>
          <div className="header-actions">
            <button 
              className="btn-configurar-vagas"
              onClick={() => setModalConfiguracaoAberto(true)}
            >
              Configurar Vagas
            </button>
            <button 
              className="btn-limpar-tickets"
              onClick={() => setModalLimparTicketsAberto(true)}
            >
              Limpar Tickets
            </button>
          </div>
        </div>
        <div className="estatisticas">
          <div className="estatistica-item">
            <span className="estatistica-valor">{total}</span>
            <span className="estatistica-label">Total de Vagas</span>
          </div>
          <div className="estatistica-item">
            <span className="estatistica-valor">{ocupadas}</span>
            <span className="estatistica-label">Vagas Ocupadas</span>
          </div>
          <div className="estatistica-item">
            <span className="estatistica-valor">{livres}</span>
            <span className="estatistica-label">Vagas Livres</span>
          </div>
          <div className="estatistica-item">
            <span className="estatistica-valor">{ocupacaoPercentual.toFixed(1)}%</span>
            <span className="estatistica-label">Taxa de Ocupação</span>
          </div>
        </div>
      </div>

      <div className="categorias-grid">
        <div className="categoria-section">
          <h2>Veículos Pequenos</h2>
          <div className="vagas-grid">
            {vagasPorCategoria.pequenos.map(numero => renderVaga(numero))}
          </div>
        </div>
        <div className="categoria-section">
          <h2>Veículos Grandes</h2>
          <div className="vagas-grid">
            {vagasPorCategoria.grandes.map(numero => renderVaga(numero))}
          </div>
        </div>
        <div className="categoria-section">
          <h2>Vagas Especiais</h2>
          <div className="vagas-grid">
            {vagasPorCategoria.especiais.map(numero => renderVaga(numero))}
          </div>
        </div>
        <div className="categoria-section">
          <h2>Motos</h2>
          <div className="vagas-grid">
            {vagasPorCategoria.motos.map(numero => renderVaga(numero))}
          </div>
        </div>
      </div>

      {renderModal()}

      {modalConfiguracaoAberto && (
        <ConfiguracaoVagas
          onClose={() => setModalConfiguracaoAberto(false)}
          onUpdate={() => {
            carregarCategorias();
            listarVagas();
          }}
        />
      )}

      {modalLimparTicketsAberto && (
        <LimparTicketsModal
          isOpen={modalLimparTicketsAberto}
          onClose={() => setModalLimparTicketsAberto(false)}
          onSuccess={handleLimparTickets}
        />
      )}
    </div>
  );
};

export default GerenciarVagas; 