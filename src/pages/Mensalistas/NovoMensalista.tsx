import React, { useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { Database } from '../../types/supabase';
import './styles.css';

type MensalistaInsert = Database['public']['Tables']['mensalistas']['Insert'];

interface NovoMensalistaProps {
  onClose: () => void;
  onSave: (mensalista: MensalistaInsert) => void;
}

const NovoMensalista: React.FC<NovoMensalistaProps> = ({ onClose, onSave }) => {
  const { setError } = useError();
  const [formData, setFormData] = useState<MensalistaInsert>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    dia_vencimento: 5 // Valor padrão
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: MensalistaInsert) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError('O nome é obrigatório');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Novo Mensalista</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="novo-mensalista-form">
          <div className="form-group">
            <label>Nome*</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
              placeholder="Digite o CPF"
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Digite o e-mail"
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleChange}
              placeholder="Digite o telefone"
            />
          </div>

          <div className="form-group">
            <label>Dia de Vencimento*</label>
            <input
              type="number"
              name="dia_vencimento"
              value={formData.dia_vencimento}
              onChange={handleChange}
              min="1"
              max="31"
              required
            />
            <small>Dia do mês para vencimento das mensalidades</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-salvar">
              Cadastrar
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

export default NovoMensalista; 