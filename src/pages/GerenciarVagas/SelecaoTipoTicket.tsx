import React from 'react';
import { CarOutlined, UserOutlined } from '@ant-design/icons';
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
    <div className="selecao-tipo-modal">
      <div className="selecao-tipo-content">
        <div className="selecao-tipo-header">
          <h2>Selecionar Tipo de Ticket</h2>
          <button className="btn-close-selecao" onClick={onClose} aria-label="Fechar seleção">
            ×
          </button>
        </div>
        <div className="selecao-buttons">
          <button 
            className="btn-tipo-ticket avulso" 
            onClick={onSelectAvulso}
            aria-label="Selecionar ticket avulso"
          >
            <CarOutlined /> Ticket Avulso
          </button>
          <button 
            className="btn-tipo-ticket mensalista" 
            onClick={onSelectMensalista}
            aria-label="Selecionar ticket mensalista"
          >
            <UserOutlined /> Ticket Mensalista
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelecaoTipoTicket; 