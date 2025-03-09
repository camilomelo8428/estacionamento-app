import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { mensalistasService } from '../../services/mensalistasService';
import { Database } from '../../types/supabase';
import NovoMensalista from './NovoMensalista';
import EditarMensalista from './EditarMensalista';
import DiaVencimento from './DiaVencimento';
import './styles.css';
import { toast } from 'react-toastify';
import { SearchOutlined } from '@ant-design/icons';

type VeiculoMensalista = Database['public']['Tables']['veiculos_mensalistas']['Row'];
type MensalistaBase = Database['public']['Tables']['mensalistas']['Row'];
interface Mensalista extends MensalistaBase {
  veiculos: VeiculoMensalista[];
}
type MensalistaInsert = Database['public']['Tables']['mensalistas']['Insert'];

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

  const formatarPlaca = (valor: string) => {
    // Remove caracteres especiais e espaços
    valor = valor.replace(/[^A-Za-z0-9]/g, '');
    
    // Formata a placa no padrão ABC-1234
    if (valor.length <= 3) {
      return valor.toUpperCase();
    } else if (valor.length <= 4) {
      return valor.slice(0, 3).toUpperCase() + valor.slice(3);
    } else if (valor.length <= 7) {
      const parte1 = valor.slice(0, 3).toUpperCase();
      const parte2 = valor.slice(3);
      return parte1 + '-' + parte2;
    }
    return valor.slice(0, 7);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Converte para maiúsculas e aplica formatação específica para placa
    const valorFormatado = name === 'placa' 
      ? formatarPlaca(value)
      : value.toUpperCase();

    setFormData(prev => ({
      ...prev,
      [name]: valorFormatado
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
                maxLength={8}
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
                placeholder="Ex: FIAT UNO"
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
                placeholder="Ex: BRANCO"
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

const Mensalistas: React.FC = () => {
  const { setError } = useError();
  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNovoMensalistaModal, setShowNovoMensalistaModal] = useState(false);
  const [showEditarMensalistaModal, setShowEditarMensalistaModal] = useState(false);
  const [showDiaVencimentoModal, setShowDiaVencimentoModal] = useState(false);
  const [selectedMensalista, setSelectedMensalista] = useState<Mensalista | null>(null);
  const [showVeiculoModal, setShowVeiculoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarMensalistas();
  }, []);

  const carregarMensalistas = async () => {
    try {
      setLoading(true);
      const response = await mensalistasService.listarMensalistas();
      if (!response.success) {
        throw new Error(response.message);
      }
      setMensalistas(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar mensalistas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = async (mensalista: Mensalista) => {
    try {
      const response = await mensalistasService.buscarMensalista(mensalista.id);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      setSelectedMensalista(response.data);
      setShowModal(true);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar detalhes do mensalista');
      console.error(error);
    }
  };

  const handleEditarMensalista = (mensalista: Mensalista) => {
    setSelectedMensalista(mensalista);
    setShowEditarMensalistaModal(true);
    setShowModal(false);
  };

  const handleEditDiaVencimento = (mensalista: Mensalista) => {
    setSelectedMensalista(mensalista);
    setShowDiaVencimentoModal(true);
  };

  const handleAddVeiculo = async (veiculo: Omit<VeiculoMensalista, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedMensalista) return;
    
    try {
      await mensalistasService.adicionarVeiculo({
        mensalista_id: selectedMensalista.id,
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        cor: veiculo.cor
      });
      
      // Recarrega os dados do mensalista
      const response = await mensalistasService.buscarMensalista(selectedMensalista.id);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      setSelectedMensalista(response.data);
      await carregarMensalistas();
      
      setShowVeiculoModal(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar veículo');
      console.error(error);
    }
  };

  const handleRemoveVeiculo = async (veiculoId: string) => {
    if (!selectedMensalista) return;
    
    try {
      await mensalistasService.removerVeiculo(veiculoId);
      
      // Recarrega os dados do mensalista
      const response = await mensalistasService.buscarMensalista(selectedMensalista.id);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      setSelectedMensalista(response.data);
      await carregarMensalistas();
    } catch (error: any) {
      setError(error.message || 'Erro ao remover veículo');
      console.error(error);
    }
  };

  const handleSaveMensalista = async (novoMensalista: MensalistaInsert) => {
    try {
      const response = await mensalistasService.criarMensalista(novoMensalista);
      if (!response.success) {
        throw new Error(response.message);
      }
      await carregarMensalistas();
      setShowNovoMensalistaModal(false);
    } catch (error: any) {
      setError(error.message || 'Erro ao criar mensalista');
      console.error(error);
    }
  };

  const handleExcluirMensalista = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este mensalista? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await mensalistasService.excluirMensalista(id);
      if (!response.success) {
        throw new Error(response.message);
      }
      await carregarMensalistas();
      toast.success('Mensalista excluído com sucesso!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir mensalista');
      console.error(error);
    }
  };

  const filteredMensalistas = mensalistas.filter(mensalista =>
    mensalista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mensalista.cpf && mensalista.cpf.includes(searchTerm))
  );

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="mensalistas-container">
      <div className="mensalistas-header">
        <h1>Gerenciar Mensalistas</h1>
        <button 
          className="btn-novo-mensalista"
          onClick={() => setShowNovoMensalistaModal(true)}
        >
          Novo Mensalista
        </button>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchOutlined className="search-icon" />
        </div>
      </div>

      <div className="table-container">
        <table className="mensalistas-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Dia Vencimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredMensalistas.map(mensalista => (
              <tr key={mensalista.id}>
                <td>{mensalista.nome}</td>
                <td>{mensalista.cpf}</td>
                <td>{mensalista.email}</td>
                <td>{mensalista.telefone}</td>
                <td>
                  {mensalista.dia_vencimento}
                  <button 
                    className="btn-editar-vencimento"
                    onClick={() => handleEditDiaVencimento(mensalista)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <div className="acoes-buttons">
                    <button
                      className="btn-detalhes"
                      onClick={() => handleShowDetails(mensalista)}
                    >
                      Detalhes
                    </button>
                    <button
                      className="btn-editar"
                      onClick={() => handleEditarMensalista(mensalista)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-excluir"
                      onClick={() => handleExcluirMensalista(mensalista.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedMensalista && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Detalhes do Mensalista</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-content">
              <div className="info-grid">
                <div className="info-section">
                  <h3>Informações Pessoais</h3>
                  <div className="info-row">
                    <span className="info-label">Nome:</span>
                    <span className="info-value">{selectedMensalista.nome}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">CPF:</span>
                    <span className="info-value">{selectedMensalista.cpf}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">E-mail:</span>
                    <span className="info-value">{selectedMensalista.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{selectedMensalista.telefone}</span>
                  </div>
                </div>
              </div>

              <div className="veiculos-section">
                <div className="veiculos-header">
                  <h3>Veículos</h3>
                  <button className="btn-add-veiculo" onClick={() => setShowVeiculoModal(true)}>
                    Adicionar Veículo
                  </button>
                </div>
                
                <div className="veiculos-grid">
                  {selectedMensalista.veiculos.map(veiculo => (
                    <div key={veiculo.id} className="veiculo-card">
                      <div className="veiculo-info">
                        <h4>{veiculo.modelo || 'Sem modelo'}</h4>
                        <p>Placa: {veiculo.placa}</p>
                        <p>Cor: {veiculo.cor || 'Não informada'}</p>
                      </div>
                      <button
                        className="btn-remove-veiculo"
                        onClick={() => handleRemoveVeiculo(veiculo.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-editar" onClick={() => handleEditarMensalista(selectedMensalista)}>
                Editar Mensalista
              </button>
              <button className="btn-cancelar" onClick={() => setShowModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Mensalista */}
      {showNovoMensalistaModal && (
        <NovoMensalista
          onClose={() => setShowNovoMensalistaModal(false)}
          onSave={handleSaveMensalista}
        />
      )}

      {/* Modal de Editar Mensalista */}
      {showEditarMensalistaModal && selectedMensalista && (
        <EditarMensalista
          mensalista={selectedMensalista}
          onClose={() => {
            setShowEditarMensalistaModal(false);
            setShowModal(true);
          }}
          onSave={async () => {
            await carregarMensalistas();
            const response = await mensalistasService.buscarMensalista(selectedMensalista.id);
            if (response.success && response.data) {
              setSelectedMensalista(response.data);
            }
          }}
        />
      )}

      {/* Modal de Novo Veículo */}
      {showVeiculoModal && selectedMensalista && (
        <NovoVeiculoModal
          mensalistaId={selectedMensalista.id}
          onClose={() => setShowVeiculoModal(false)}
          onSave={async () => {
            const response = await mensalistasService.buscarMensalista(selectedMensalista.id);
            if (response.success && response.data) {
              setSelectedMensalista(response.data);
            }
            await carregarMensalistas();
          }}
        />
      )}

      {showDiaVencimentoModal && selectedMensalista && (
        <DiaVencimento
          mensalistaId={selectedMensalista.id}
          diaVencimentoAtual={selectedMensalista.dia_vencimento}
          onClose={() => setShowDiaVencimentoModal(false)}
          onUpdate={carregarMensalistas}
        />
      )}
    </div>
  );
};

export default Mensalistas; 