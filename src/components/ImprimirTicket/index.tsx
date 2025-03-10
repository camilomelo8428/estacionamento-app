import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { printService } from '../../services/printService';
import { toast } from 'react-toastify';
import './styles.css';

interface ImprimirTicketProps {
  ticket: {
    placa: string;
    modelo: string;
    cor: string;
    hora_entrada: string;
    vaga: string;
  };
  empresa: {
    nome: string;
    endereco: string;
    telefone: string;
    cnpj?: string;
  };
}

const ImprimirTicket: React.FC<ImprimirTicketProps> = ({ ticket, empresa }) => {
  const [metodoImpressao, setMetodoImpressao] = useState<'pdf' | 'epson' | 'share'>('pdf');
  const [isMobile, setIsMobile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsMobile(mobile);
      if (mobile) {
        setMetodoImpressao('share');
      }
    };

    checkMobile();
  }, []);

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleImprimir = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const conteudo = {
        empresa: {
          nome: empresa.nome,
          endereco: empresa.endereco,
          telefone: empresa.telefone,
          cnpj: empresa.cnpj
        },
        placa: ticket.placa,
        modelo: ticket.modelo,
        cor: ticket.cor,
        vaga: ticket.vaga,
        entrada: formatarData(ticket.hora_entrada)
      };

      const resultado = await printService.print({
        type: 'ticket',
        content: conteudo,
        options: {
          method: isMobile ? 'share' : metodoImpressao,
          paperSize: 'A4',
          orientation: 'portrait'
        }
      });

      if (resultado) {
        toast.success(isMobile ? 'Ticket pronto para compartilhamento' : 'Ticket gerado com sucesso');
      } else {
        throw new Error('Falha ao processar o ticket');
      }
    } catch (error) {
      console.error('Erro ao processar ticket:', error);
      toast.error('Não foi possível processar o ticket. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="ticket-impressao">
      <div className="ticket-content">
        <div className="ticket-header">
          <h1>{empresa.nome}</h1>
          <p>{empresa.endereco}</p>
          <p>Tel: {empresa.telefone}</p>
          {empresa.cnpj && <p>CNPJ: {empresa.cnpj}</p>}
        </div>

        <div className="ticket-info">
          <h2>TICKET DE ESTACIONAMENTO</h2>
          
          <div className="info-row">
            <span className="label">Placa:</span>
            <span className="value">{ticket.placa}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Modelo:</span>
            <span className="value">{ticket.modelo}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Cor:</span>
            <span className="value">{ticket.cor}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Vaga:</span>
            <span className="value">{ticket.vaga}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Entrada:</span>
            <span className="value">{formatarData(ticket.hora_entrada)}</span>
          </div>
        </div>

        <div className="ticket-footer">
          <p>Obrigado pela preferência!</p>
        </div>
      </div>

      <div className="print-actions">
        {!isMobile && (
          <select 
            value={metodoImpressao} 
            onChange={(e) => setMetodoImpressao(e.target.value as 'pdf' | 'epson' | 'share')}
            className="print-method"
            disabled={isProcessing}
          >
            <option value="pdf">Gerar PDF</option>
            <option value="epson">Impressora Epson</option>
            <option value="share">Compartilhar</option>
          </select>
        )}

        <button 
          className="btn-imprimir"
          onClick={handleImprimir}
          disabled={isProcessing}
        >
          {isProcessing 
            ? 'Processando...' 
            : isMobile 
              ? 'Compartilhar Ticket' 
              : 'Imprimir Ticket'
          }
        </button>
      </div>
    </div>
  );
};

export default ImprimirTicket; 