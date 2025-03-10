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
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Limpar a URL do PDF quando o componente for desmontado
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleGerarPDF = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Limpar URL anterior se existir
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

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

      const novaUrl = await printService.print({
        type: 'ticket',
        content: conteudo,
        options: {
          method: 'pdf',
          paperSize: 'A4',
          orientation: 'portrait'
        }
      });

      setPdfUrl(novaUrl);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Não foi possível gerar o PDF. Tente novamente.');
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
        <button 
          className="btn-imprimir"
          onClick={handleGerarPDF}
          disabled={isProcessing}
        >
          {isProcessing ? 'Gerando PDF...' : 'Gerar PDF'}
        </button>

        {pdfUrl && (
          <a 
            href={pdfUrl}
            download="ticket.pdf"
            className="btn-download"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default ImprimirTicket; 