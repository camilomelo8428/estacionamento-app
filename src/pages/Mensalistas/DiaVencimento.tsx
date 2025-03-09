import React, { useState } from 'react';
import { mensalistasService } from '../../services/mensalistasService';
import { useError } from '../../contexts/ErrorContext';
import { toast } from 'react-toastify';

interface DiaVencimentoProps {
  mensalistaId: string;
  diaVencimentoAtual: number;
  onClose: () => void;
  onUpdate: () => void;
}

const DiaVencimento: React.FC<DiaVencimentoProps> = ({
  mensalistaId,
  diaVencimentoAtual,
  onClose,
  onUpdate
}) => {
  const { setError } = useError();
  const [diaVencimento, setDiaVencimento] = useState(diaVencimentoAtual);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await mensalistasService.atualizarMensalista(mensalistaId, {
        dia_vencimento: diaVencimento
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success('Dia de vencimento atualizado com sucesso!');
      onUpdate();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar dia de vencimento');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Alterar Dia de Vencimento</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Dia do Vencimento*</label>
            <input
              type="number"
              value={diaVencimento}
              onChange={(e) => setDiaVencimento(parseInt(e.target.value))}
              min="1"
              max="31"
              required
            />
            <small>O dia de vencimento será aplicado para as próximas mensalidades</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-salvar">
              Salvar
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

export default DiaVencimento; 