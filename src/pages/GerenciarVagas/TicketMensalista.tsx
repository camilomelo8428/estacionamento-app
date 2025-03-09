import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { mensalistasService } from '../../services/mensalistasService';
import { toast } from 'react-toastify';
import { Database } from '../../types/supabase';
import './styles.css';

interface ListaMensalistasResponse {
  success: boolean;
  message: string;
  data: Mensalista[];
}

interface Mensalista {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  status?: 'EM_DIA' | 'PENDENTE';
}

interface StatusMensalistaResponse {
  success: boolean;
  message: string;
  data?: {
    possuiPendencias: boolean;
    mensalidadesAtrasadas: number;
    mensalidadesPendentes: number;
  };
}

interface ListaVeiculosResponse {
  success: boolean;
  message: string;
  data: VeiculoMensalista[];
}

interface VeiculoMensalista {
  id: string;
  mensalista_id: string;
  placa: string;
  modelo: string;
  cor: string;
}

interface TicketMensalistaProps {
  numeroVaga: string;
  onClose: () => void;
  onSave: (dados: any) => Promise<void>;
}

const TicketMensalista: React.FC<TicketMensalistaProps> = ({ numeroVaga, onClose, onSave }) => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  const [selectedMensalista, setSelectedMensalista] = useState('');
  const [veiculos, setVeiculos] = useState<VeiculoMensalista[]>([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState('');

  useEffect(() => {
    carregarMensalistas();
  }, []);

  const carregarMensalistas = async () => {
    try {
      setLoading(true);
      const response: ListaMensalistasResponse = await mensalistasService.listarMensalistas();
      if (response.success) {
        // Verificar status de cada mensalista
        const mensalistasComStatus = await Promise.all(
          response.data.map(async (mensalista) => {
            const statusResponse = await mensalistasService.verificarStatusMensalista(mensalista.id);
            return {
              ...mensalista,
              status: (statusResponse.success && statusResponse.data?.possuiPendencias) ? 'PENDENTE' as const : 'EM_DIA' as const
            };
          })
        );
        setMensalistas(mensalistasComStatus);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculos = async (mensalistaId: string) => {
    try {
      const response: ListaVeiculosResponse = await mensalistasService.listarVeiculos(mensalistaId);
      if (response.success) {
        setVeiculos(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleMensalistaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mensalistaId = e.target.value;
    setSelectedMensalista(mensalistaId);
    setSelectedVeiculo('');
    
    if (mensalistaId) {
      // Verificar status do mensalista
      const statusResponse: StatusMensalistaResponse = await mensalistasService.verificarStatusMensalista(mensalistaId);
      if (statusResponse.success && statusResponse.data?.possuiPendencias) {
        toast.error('Não é possível selecionar este mensalista pois existem mensalidades pendentes ou em atraso. Por favor, regularize os pagamentos antes de utilizar uma vaga.');
        setSelectedMensalista('');
        return;
      }
      
      await carregarVeiculos(mensalistaId);
    } else {
      setVeiculos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMensalista || !selectedVeiculo) {
      setError('Selecione um mensalista e um veículo');
      return;
    }

    // Verificar status do mensalista novamente antes de salvar
    const statusResponse: StatusMensalistaResponse = await mensalistasService.verificarStatusMensalista(selectedMensalista);
    if (statusResponse.success && statusResponse.data?.possuiPendencias) {
      toast.error('Não é possível criar o ticket pois o mensalista possui mensalidades pendentes ou em atraso.');
      return;
    }

    const veiculo = veiculos.find(v => v.id === selectedVeiculo);
    if (!veiculo) {
      setError('Veículo não encontrado');
      return;
    }

    const dados = {
      mensalista_id: selectedMensalista,
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      numeroVaga
    };

    try {
      await onSave(dados);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao criar ticket mensalista');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Ticket Mensalista - Vaga {numeroVaga}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mensalista</label>
            <select
              value={selectedMensalista}
              onChange={handleMensalistaChange}
              required
            >
              <option value="">Selecione um mensalista</option>
              {mensalistas.map(mensalista => (
                <option 
                  key={mensalista.id} 
                  value={mensalista.id}
                  disabled={mensalista.status === 'PENDENTE'}
                  className={mensalista.status === 'PENDENTE' ? 'mensalista-pendente' : 'mensalista-em-dia'}
                >
                  {mensalista.nome} {mensalista.status === 'PENDENTE' ? '(Pagamento Pendente)' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedMensalista && (
            <div className="form-group">
              <label>Veículo</label>
              <select
                value={selectedVeiculo}
                onChange={(e) => setSelectedVeiculo(e.target.value)}
                required
              >
                <option value="">Selecione um veículo</option>
                {veiculos.map(veiculo => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.modelo} - {veiculo.placa}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn-confirmar">
              Confirmar
            </button>
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketMensalista; 