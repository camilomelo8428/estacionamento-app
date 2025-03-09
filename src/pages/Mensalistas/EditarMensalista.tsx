import React, { useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { mensalistasService } from '../../services/mensalistasService';
import { Database } from '../../types/supabase';

type VeiculoMensalista = Database['public']['Tables']['veiculos_mensalistas']['Row'];
type MensalistaBase = Database['public']['Tables']['mensalistas']['Row'];
interface Mensalista extends MensalistaBase {
  veiculos: VeiculoMensalista[];
}

interface EditarMensalistaProps {
  mensalista: Mensalista;
  onClose: () => void;
  onSave: () => void;
}

const EditarMensalista: React.FC<EditarMensalistaProps> = ({ mensalista, onClose, onSave }) => {
  const { setError } = useError();
  const [formData, setFormData] = useState({
    nome: mensalista.nome || '',
    cpf: mensalista.cpf || '',
    email: mensalista.email || '',
    telefone: mensalista.telefone || ''
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
      if (!formData.nome || !formData.cpf || !formData.email || !formData.telefone) {
        throw new Error('Todos os campos são obrigatórios');
      }

      await mensalistasService.atualizarMensalista(mensalista.id, formData);
      onSave();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar mensalista');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal editar-mensalista-modal">
        <div className="modal-header">
          <h2>Editar Mensalista</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="form-mensalista">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemplo@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
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

export default EditarMensalista; 