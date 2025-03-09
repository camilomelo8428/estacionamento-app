import React, { useState } from 'react';
import { categoriasService } from '../../services/categoriasService';
import { toast } from 'react-toastify';
import './styles.css';

interface AjustarLimiteVagasProps {
  categoriaId: string;
  categoriaAtual: {
    nome: string;
    vagas: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const AjustarLimiteVagas: React.FC<AjustarLimiteVagasProps> = ({
  categoriaId,
  categoriaAtual,
  onClose,
  onSuccess
}) => {
  const [novoLimite, setNovoLimite] = useState(categoriaAtual.vagas);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novoLimite < 1) {
      toast.error('O limite mínimo é 1 vaga');
      return;
    }

    try {
      setSalvando(true);
      const response = await categoriasService.atualizarLimiteVagas(categoriaId, novoLimite);
      
      if (response.success) {
        toast.success('Limite de vagas atualizado com sucesso');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar limite de vagas');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajustar Limite de Vagas</h2>
        <p>Categoria: {categoriaAtual.nome}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="novoLimite">Novo limite de vagas:</label>
            <input
              type="number"
              id="novoLimite"
              min="1"
              value={novoLimite}
              onChange={(e) => setNovoLimite(parseInt(e.target.value) || 0)}
              disabled={salvando}
            />
            <small className="form-help">
              Digite o número desejado de vagas para esta categoria.
              O sistema não permitirá reduzir o limite abaixo do número de vagas atualmente ocupadas.
            </small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-salvar"
              disabled={salvando || novoLimite < 1 || novoLimite === categoriaAtual.vagas}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjustarLimiteVagas; 