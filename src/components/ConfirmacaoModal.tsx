import React from 'react';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './styles.css';

interface ConfirmacaoModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  tipo?: 'aviso' | 'sucesso' | 'erro';
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ConfirmacaoModal: React.FC<ConfirmacaoModalProps> = ({
  isOpen,
  titulo,
  mensagem,
  tipo = 'aviso',
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar
}) => {
  if (!isOpen) return null;

  const getIcone = () => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircleOutlined className="icone sucesso" />;
      case 'erro':
        return <CloseCircleOutlined className="icone erro" />;
      default:
        return <ExclamationCircleOutlined className="icone aviso" />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal confirmacao-modal ${tipo}`}>
        <div className="modal-content">
          <div className="confirmacao-header">
            {getIcone()}
            <h2>{titulo}</h2>
          </div>
          
          <div className="confirmacao-mensagem">
            <p>{mensagem}</p>
          </div>

          <div className="confirmacao-acoes">
            <button 
              className={`btn-confirmar ${tipo}`}
              onClick={onConfirmar}
            >
              {textoBotaoConfirmar}
            </button>
            <button 
              className="btn-cancelar"
              onClick={onCancelar}
            >
              {textoBotaoCancelar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoModal; 