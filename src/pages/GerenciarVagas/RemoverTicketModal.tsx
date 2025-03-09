import React, { useState } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { ticketsService } from '../../services/ticketsService';
import { useVagas } from '../../contexts/VagasContext';
import './styles.css';

interface RemoverTicketModalProps {
  ticketId: string;
  vagaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RemoverTicketModal: React.FC<RemoverTicketModalProps> = ({
  ticketId,
  vagaId,
  onClose,
  onSuccess
}) => {
  const { setError } = useError();
  const { liberarVaga } = useVagas();
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRemoverTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senha) {
      setError('Por favor, insira a senha do administrador');
      return;
    }

    setLoading(true);
    try {
      // Verificar a senha do administrador (substitua pela sua lógica de autenticação)
      if (senha !== process.env.REACT_APP_ADMIN_PASSWORD) {
        throw new Error('Senha do administrador incorreta');
      }

      // Remover o ticket
      await ticketsService.removerTicket(ticketId);
      
      // Liberar a vaga
      await liberarVaga(vagaId);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao remover ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal remover-ticket-modal">
        <div className="modal-header">
          <h2>Remover Ticket</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="aviso-remocao">
            <p>⚠️ Atenção: Esta ação é irreversível!</p>
            <p>Para remover este ticket, é necessária a senha do administrador.</p>
          </div>

          <form onSubmit={handleRemoverTicket}>
            <div className="form-group">
              <label>Senha do Administrador</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha do administrador"
                required
              />
            </div>

            <div className="modal-actions">
              <button 
                type="submit" 
                className="btn-remover" 
                disabled={loading}
              >
                {loading ? 'Removendo...' : 'Remover Ticket'}
              </button>
              <button 
                type="button" 
                className="btn-cancelar" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RemoverTicketModal; 