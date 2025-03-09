import React from 'react';
import './SelecaoTipoTicket/styles.css';

interface SelecaoTipoTicketProps {
  onClose: () => void;
  onSelectAvulso: () => void;
  onSelectMensalista: () => void;
}

const SelecaoTipoTicket: React.FC<SelecaoTipoTicketProps> = ({
  onClose,
  onSelectAvulso,
  onSelectMensalista
}) => {
  return (
    <div className="modal-overlay">
      <div className="selecao-tipo-content">
        <div className="selecao-tipo-header">
          <h2>Selecionar Tipo de Ticket</h2>
          <button className="btn-close-selecao" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="selecao-buttons">
          <button className="btn-tipo-ticket avulso" onClick={onSelectAvulso}>
            Ticket Avulso
          </button>
          <button className="btn-tipo-ticket mensalista" onClick={onSelectMensalista}>
            Ticket Mensalista
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelecaoTipoTicket; 