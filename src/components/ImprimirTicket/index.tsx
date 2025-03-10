import React, { useState } from 'react';
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

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleImprimir = async () => {
    try {
      const conteudo = {
        ...ticket,
        hora_entrada: formatarData(ticket.hora_entrada),
        empresa
      };

      const resultado = await printService.print({
        type: 'ticket',
        content: conteudo,
        options: {
          method: metodoImpressao,
          paperSize: metodoImpressao === 'epson' ? '80mm' : 'A4'
        }
      });

      if (resultado) {
        toast.success('Ticket enviado para impressão');
      } else {
        toast.error('Erro ao imprimir ticket');
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao imprimir ticket');
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
        <select 
          value={metodoImpressao} 
          onChange={(e) => setMetodoImpressao(e.target.value as 'pdf' | 'epson' | 'share')}
          className="print-method"
        >
          <option value="pdf">Gerar PDF</option>
          <option value="epson">Impressora Epson</option>
          <option value="share">Compartilhar</option>
        </select>

        <button 
          className="btn-imprimir"
          onClick={handleImprimir}
        >
          Imprimir Ticket
        </button>
      </div>
    </div>
  );
};

export default ImprimirTicket; 