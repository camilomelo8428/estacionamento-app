import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrinterOutlined } from '@ant-design/icons';
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
  const formatarData = (data: string) => {
    return format(new Date(data), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de Estacionamento</title>
            <meta charset="UTF-8">
            <style>
              @page {
                margin: 0;
                size: 80mm auto;
              }
              body {
                font-family: monospace;
                width: 80mm;
                margin: 0;
                padding: 2mm;
                font-size: 12px;
                line-height: 1.2;
              }
              .ticket-header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 2mm;
                margin-bottom: 2mm;
              }
              .ticket-header h1 {
                font-size: 14px;
                margin: 0 0 1mm;
                font-weight: bold;
              }
              .ticket-header p {
                font-size: 12px;
                margin: 0.5mm 0;
              }
              .ticket-info {
                margin: 2mm 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 0.5mm 0;
                font-family: monospace;
              }
              .info-row span:first-child {
                width: 40%;
              }
              .info-row span:last-child {
                width: 60%;
                text-align: right;
              }
              .ticket-footer {
                text-align: center;
                border-top: 1px dashed #000;
                margin-top: 2mm;
                padding-top: 2mm;
              }
              .ticket-footer p {
                font-size: 10px;
                margin: 0.5mm 0;
              }
              .ticket-numero {
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                margin-top: 2mm;
                text-align: center;
              }
              * {
                font-family: monospace !important;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="ticket-header">
              <h1>${empresa.nome}</h1>
              <p>${empresa.endereco}</p>
              <p>${empresa.telefone}</p>
              ${empresa.cnpj ? `<p>CNPJ: ${empresa.cnpj}</p>` : ''}
            </div>

            <div class="ticket-info">
              <div class="info-row">
                <span>PLACA:</span>
                <span>${ticket.placa}</span>
              </div>
              <div class="info-row">
                <span>MODELO:</span>
                <span>${ticket.modelo}</span>
              </div>
              <div class="info-row">
                <span>COR:</span>
                <span>${ticket.cor}</span>
              </div>
              <div class="info-row">
                <span>VAGA:</span>
                <span>${ticket.vaga}</span>
              </div>
              <div class="info-row">
                <span>ENTRADA:</span>
                <span>${formatarData(ticket.hora_entrada)}</span>
              </div>
            </div>

            <div class="ticket-footer">
              <p>GUARDE ESTE TICKET EM LOCAL SEGURO</p>
              <p>NECESSÁRIO PARA RETIRADA DO VEÍCULO</p>
              <div class="ticket-numero">
                #${ticket.vaga}-${format(new Date(ticket.hora_entrada), "yyyyMMddHHmmss")}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="ticket-impressao">
      <div className="ticket-content">
        <div className="ticket-header">
          <h1>{empresa.nome}</h1>
          <p>{empresa.endereco}</p>
          <p>{empresa.telefone}</p>
          {empresa.cnpj && <p>CNPJ: {empresa.cnpj}</p>}
        </div>

        <div className="ticket-info">
          <div className="info-row">
            <span className="label">PLACA:</span>
            <span className="value">{ticket.placa}</span>
          </div>
          
          <div className="info-row">
            <span className="label">MODELO:</span>
            <span className="value">{ticket.modelo}</span>
          </div>
          
          <div className="info-row">
            <span className="label">COR:</span>
            <span className="value">{ticket.cor}</span>
          </div>
          
          <div className="info-row">
            <span className="label">VAGA:</span>
            <span className="value">{ticket.vaga}</span>
          </div>
          
          <div className="info-row">
            <span className="label">ENTRADA:</span>
            <span className="value">{formatarData(ticket.hora_entrada)}</span>
          </div>
        </div>

        <div className="ticket-footer">
          <p>GUARDE ESTE TICKET EM LOCAL SEGURO</p>
          <p>NECESSÁRIO PARA RETIRADA DO VEÍCULO</p>
          <div className="ticket-numero">
            #{ticket.vaga}-{format(new Date(ticket.hora_entrada), "yyyyMMddHHmmss")}
          </div>
        </div>
      </div>

      <button className="btn-imprimir" onClick={handleImprimir}>
        <PrinterOutlined /> Imprimir Ticket
      </button>
    </div>
  );
};

export default ImprimirTicket; 