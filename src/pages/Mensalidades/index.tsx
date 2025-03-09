import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { mensalidadesService } from '../../services/mensalidadesService';
import NovaMensalidade from './NovaMensalidade';
import ImprimirReciboMensalidade from '../../components/ImprimirReciboMensalidade';
import { toast } from 'react-toastify';
import './styles.css';

interface Mensalista {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
}

interface Mensalidade {
  id: string;
  mensalista_id: string;
  mensalista: Mensalista;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  created_at: string;
  updated_at: string;
  valor_multa: number;
  valor_juros: number;
  valor_total: number;
}

const Mensalidades: React.FC = () => {
  const { setError } = useError();
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovaMensalidade, setShowNovaMensalidade] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState<Mensalidade | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  useEffect(() => {
    carregarMensalidades();
  }, []);

  const carregarMensalidades = async () => {
    try {
      setLoading(true);
      
      // Verificar e atualizar mensalidades em atraso
      await mensalidadesService.verificarMensalidadesEmAtraso();
      
      const response = await mensalidadesService.listarMensalidades();
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setMensalidades(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar mensalidades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensalidade?')) {
      return;
    }

    try {
      const response = await mensalidadesService.excluirMensalidade(id);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      await carregarMensalidades();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir mensalidade');
    }
  };

  const handlePagamento = async (id: string) => {
    try {
      const response = await mensalidadesService.pagarMensalidade(id);
      if (response.success) {
        const mensalidadePaga = mensalidades.find(m => m.id === id);
        if (mensalidadePaga) {
          const mensalidadeAtualizada: Mensalidade = {
            ...mensalidadePaga,
            status: 'PAGO' as const,
            data_pagamento: new Date().toISOString()
          };
          setMensalidadeSelecionada(mensalidadeAtualizada);
          setShowRecibo(true);
          setTimeout(() => {
            window.print();
          }, 500);
        }
        await carregarMensalidades();
        toast.success('Mensalidade paga com sucesso!');
      }
    } catch (error) {
      setError('Erro ao processar pagamento da mensalidade');
    }
  };

  const handleSaveMensalidade = async (novaMensalidade: any) => {
    try {
      const response = await mensalidadesService.criarMensalidade(novaMensalidade);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      await carregarMensalidades();
      setShowNovaMensalidade(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar mensalidade');
    }
  };

  const filtrarMensalidades = () => {
    if (filtroStatus === 'TODOS') return mensalidades;
    return mensalidades.filter(m => m.status === filtroStatus);
  };

  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    // Ajusta para o fuso horário do Brasil
    dataObj.setHours(dataObj.getHours() + 3);
    return dataObj.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcularDiasAtraso = (dataVencimento: string): number => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
    return diferenca;
  };

  const renderStatus = (status: string) => {
    return (
      <span className={`status ${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="mensalidades-container">
      <div className="mensalidades-header">
        <h1>Gerenciar Mensalidades</h1>
        <button className="btn-nova-mensalidade" onClick={() => setShowNovaMensalidade(true)}>
          Nova Mensalidade
        </button>
      </div>

      <div className="filtros">
        <div className="filtro-status">
          <button
            className={filtroStatus === 'TODOS' ? 'active' : ''}
            onClick={() => setFiltroStatus('TODOS')}
          >
            Todos
          </button>
          <button
            className={filtroStatus === 'PENDENTES' ? 'active' : ''}
            onClick={() => setFiltroStatus('PENDENTES')}
          >
            Pendentes
          </button>
          <button
            className={filtroStatus === 'PAGOS' ? 'active' : ''}
            onClick={() => setFiltroStatus('PAGOS')}
          >
            Pagos
          </button>
          <button
            className={filtroStatus === 'ATRASADOS' ? 'active' : ''}
            onClick={() => setFiltroStatus('ATRASADOS')}
          >
            Atrasados
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="mensalidades-table">
          <thead>
            <tr>
              <th>CLIENTE</th>
              <th>PREÇO POR MÊS</th>
              <th>DATA DE VENCIMENTO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filtrarMensalidades().map((mensalidade) => (
              <tr key={mensalidade.id}>
                <td>{mensalidade.mensalista.nome}</td>
                <td>{formatarMoeda(mensalidade.valor)}</td>
                <td>{formatarData(mensalidade.data_vencimento)}</td>
                <td>{renderStatus(mensalidade.status)}</td>
                <td className="acoes">
                  {mensalidade.status !== 'PAGO' && (
                    <button
                      className="btn-pagar"
                      onClick={() => handlePagamento(mensalidade.id)}
                    >
                      Pagar
                    </button>
                  )}
                  <button
                    className="btn-excluir"
                    onClick={() => handleDelete(mensalidade.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNovaMensalidade && (
        <div className="modal-overlay">
          <div className="modal">
            <NovaMensalidade
              onClose={() => setShowNovaMensalidade(false)}
              onSave={handleSaveMensalidade}
            />
          </div>
        </div>
      )}

      {showRecibo && mensalidadeSelecionada && (
        <div className="modal-overlay">
          <div className="modal recibo-modal">
            <div className="modal-header">
              <h2>Recibo de Pagamento</h2>
              <div className="modal-actions">
                <button 
                  className="btn-imprimir" 
                  onClick={() => window.print()}
                >
                  Imprimir Novamente
                </button>
                <button 
                  className="btn-fechar" 
                  onClick={() => setShowRecibo(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
            <div className="modal-content">
              <ImprimirReciboMensalidade
                mensalidade={mensalidadeSelecionada}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensalidades; 