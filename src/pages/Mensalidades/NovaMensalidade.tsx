import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { mensalistasService } from '../../services/mensalistasService';
import { Database } from '../../types/supabase';
import './styles.css';

type Mensalista = Database['public']['Tables']['mensalistas']['Row'];
type MensalidadeInsert = Database['public']['Tables']['mensalidades']['Insert'];

interface NovaMensalidadeProps {
  onClose: () => void;
  onSave: (mensalidade: MensalidadeInsert) => void;
}

const NovaMensalidade: React.FC<NovaMensalidadeProps> = ({ onClose, onSave }) => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  
  // Função para obter a data atual no formato YYYY-MM-DD considerando o fuso horário do Brasil
  const getDataAtual = () => {
    const data = new Date();
    // Ajusta para o fuso horário do Brasil (UTC-3)
    data.setHours(data.getHours() + 3);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const [formData, setFormData] = useState<Partial<MensalidadeInsert>>({
    mensalista_id: '',
    valor: 0,
    status: 'PENDENTE'
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratamento específico para o campo valor
    let processedValue: string | number = value;
    if (name === 'valor') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? processedValue : String(processedValue)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mensalista_id) {
      setError('Selecione um mensalista');
      return;
    }

    if (!formData.valor || formData.valor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    // Envia os dados da mensalidade para criação
    onSave(formData as MensalidadeInsert);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Nova Mensalidade</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mensalista*</label>
            <select
              name="mensalista_id"
              value={formData.mensalista_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um mensalista</option>
              {mensalistas.map(mensalista => (
                <option key={mensalista.id} value={mensalista.id}>
                  {mensalista.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Valor*</label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              placeholder="0,00"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-salvar">
              Criar Mensalidade
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

export default NovaMensalidade; 