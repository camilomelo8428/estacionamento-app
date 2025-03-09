interface TicketData {
  placa: string;
  modelo: string;
  cor: string;
  hora_entrada: string;
  vaga: string;
}

interface EmpresaData {
  nome: string;
  endereco: string;
  telefone: string;
  cnpj: string;
}

interface ReciboData {
  valor: number;
  cliente: string;
  cpf: string | null;
  dataVencimento: string | null;
  dataPagamento: string | null;
  valorBase: number;
  valorMulta: number;
  valorJuros: number;
  numeroRecibo: string;
}

interface TicketReciboData {
  placa: string;
  modelo: string;
  cor: string;
  vaga: string;
  hora_entrada: string;
  hora_saida: string;
  valor: number;
  tempo_total: string;
}

const THERMAL_PRINT_STYLES = `
  @page {
    margin: 0;
    size: 80mm auto;
  }
  body {
    font-family: monospace;
    width: 70mm;
    margin: 0 auto;
    padding: 2mm;
    font-size: 12px;
    line-height: 1.2;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .ticket-header {
    text-align: center;
    margin-bottom: 2mm;
    width: 100%;
  }
  .ticket-header h2 {
    font-size: 14px;
    margin: 0 0 1mm;
    font-weight: bold;
  }
  .ticket-header p {
    font-size: 12px;
    margin: 0.5mm 0;
  }
  .divisor {
    border-top: 1px dashed #000;
    margin: 2mm 0;
    width: 100%;
  }
  .ticket-info {
    margin: 2mm 0;
    width: 100%;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    margin: 1mm 0;
    width: 100%;
  }
  .info-row span:first-child {
    width: 35%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-row span:last-child {
    width: 65%;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-row.total {
    font-weight: bold;
    font-size: 13px;
    margin: 2mm 0;
  }
  .ticket-footer {
    text-align: center;
    margin-top: 2mm;
    width: 100%;
  }
  .ticket-footer p {
    font-size: 10px;
    margin: 1mm 0;
    text-transform: uppercase;
  }
  .ticket-numero {
    font-family: monospace;
    font-size: 12px;
    font-weight: bold;
    margin-top: 2mm;
    text-align: center;
  }
  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      width: 70mm;
      margin: 0 auto;
      padding: 2mm;
    }
    * {
      font-family: monospace !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

export const imprimirTicket = (ticket: TicketData, empresa: EmpresaData): Promise<void> => {
  return new Promise<void>((resolve) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const dataFormatada = new Date(ticket.hora_entrada).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const ticketNumero = `${ticket.vaga}-${new Date(ticket.hora_entrada).getTime()}`;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket de Estacionamento</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${THERMAL_PRINT_STYLES}</style>
          </head>
          <body>
            <div class="ticket-container">
              <div class="ticket-header">
                <h2>${empresa.nome.toUpperCase()}</h2>
                <p>${empresa.endereco}</p>
                <p>${empresa.telefone}</p>
                ${empresa.cnpj ? `<p>CNPJ: ${empresa.cnpj}</p>` : ''}
              </div>
              <div class="ticket-info">
                <div class="info-row">
                  <span>PLACA:</span>
                  <span>${ticket.placa.toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>MODELO:</span>
                  <span>${ticket.modelo.toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>COR:</span>
                  <span>${ticket.cor.toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>VAGA:</span>
                  <span>${ticket.vaga}</span>
                </div>
                <div class="info-row">
                  <span>ENTRADA:</span>
                  <span>${dataFormatada}</span>
                </div>
              </div>
              <div class="ticket-footer">
                <p>GUARDE ESTE TICKET EM LOCAL SEGURO</p>
                <p>NECESSÁRIO PARA RETIRADA DO VEÍCULO</p>
                <div class="ticket-numero">
                  #${ticketNumero}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 250);
    } else {
      resolve();
    }
  });
};

export const imprimirRecibo = (recibo: ReciboData, empresa: EmpresaData): Promise<void> => {
  return new Promise<void>((resolve) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Calcular o valor total somando valor base, multa e juros
      const valorTotal = recibo.valorBase + (recibo.valorMulta || 0) + (recibo.valorJuros || 0);

      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo de Pagamento</title>
            <style>
              @page {
                margin: 0;
                size: 80mm auto;
              }
              body {
                font-family: monospace;
                width: 70mm;
                margin: 0;
                padding: 5mm;
                font-size: 12px;
                line-height: 1.4;
              }
              .ticket-header {
                text-align: center;
                padding-bottom: 3mm;
                margin-bottom: 3mm;
              }
              .ticket-header h2 {
                font-size: 14px;
                margin: 0 0 2mm;
                font-weight: bold;
                text-transform: uppercase;
              }
              .ticket-header p {
                font-size: 12px;
                margin: 1mm 0;
              }
              .divisor {
                border-top: 1px dashed #000;
                margin: 3mm 0;
              }
              .ticket-info {
                margin: 3mm 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 1.5mm 0;
              }
              .info-row span:first-child {
                font-weight: normal;
                text-transform: uppercase;
              }
              .info-row span:last-child {
                text-align: right;
                text-transform: uppercase;
              }
              .total {
                margin-top: 2mm;
                font-weight: bold;
                font-size: 14px;
              }
              .ticket-footer {
                text-align: center;
                margin-top: 3mm;
                padding-top: 3mm;
              }
              .ticket-footer p {
                font-size: 10px;
                margin: 1mm 0;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="ticket-header">
              <h2>${empresa.nome}</h2>
              <p>${empresa.endereco}</p>
              <p>CNPJ: ${empresa.cnpj}</p>
              <p>${empresa.telefone}</p>
            </div>
            <div class="divisor"></div>
            <div class="ticket-info">
              <div class="info-row">
                <span>Recibo Nº:</span>
                <span>${recibo.numeroRecibo}</span>
              </div>
              <div class="info-row">
                <span>Cliente:</span>
                <span>${recibo.cliente}</span>
              </div>
              ${recibo.cpf ? `
              <div class="info-row">
                <span>CPF:</span>
                <span>${recibo.cpf}</span>
              </div>
              ` : ''}
              ${recibo.dataVencimento ? `
              <div class="info-row">
                <span>Vencimento:</span>
                <span>${new Date(recibo.dataVencimento).toLocaleDateString('pt-BR')}</span>
              </div>
              ` : ''}
              ${recibo.dataPagamento ? `
              <div class="info-row">
                <span>Data Pagamento:</span>
                <span>${new Date(recibo.dataPagamento).toLocaleDateString('pt-BR')}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span>Valor Base:</span>
                <span>${recibo.valorBase.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}</span>
              </div>
              ${recibo.valorMulta > 0 ? `
              <div class="info-row">
                <span>Multa:</span>
                <span>${recibo.valorMulta.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}</span>
              </div>
              ` : ''}
              ${recibo.valorJuros > 0 ? `
              <div class="info-row">
                <span>Juros:</span>
                <span>${recibo.valorJuros.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}</span>
              </div>
              ` : ''}
              <div class="divisor"></div>
              <div class="info-row total">
                <span>Valor Total:</span>
                <span>${valorTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}</span>
              </div>
            </div>
            <div class="divisor"></div>
            <div class="ticket-footer">
              <p>Recibo de Pagamento</p>
              <p>Guarde este recibo para futuras consultas</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 250);
    } else {
      resolve();
    }
  });
};

export const imprimirReciboTicket = (ticket: TicketReciboData, empresa: EmpresaData): Promise<void> => {
  return new Promise<void>((resolve) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const dataEntrada = new Date(ticket.hora_entrada).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const dataSaida = new Date(ticket.hora_saida).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recibo de Pagamento - Ticket</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${THERMAL_PRINT_STYLES}</style>
          </head>
          <body>
            <div class="ticket-container">
              <div class="ticket-header">
                <h2>${empresa.nome}</h2>
                <p>${empresa.endereco}</p>
                <p>${empresa.telefone}</p>
                <p>CNPJ: ${empresa.cnpj}</p>
              </div>
              <div class="divisor"></div>
              <div class="ticket-info">
                <div class="info-row">
                  <span>PLACA:</span>
                  <span>${ticket.placa.toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>MODELO:</span>
                  <span>${ticket.modelo ? ticket.modelo.toUpperCase() : ''}</span>
                </div>
                <div class="info-row">
                  <span>COR:</span>
                  <span>${ticket.cor.toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span>VAGA:</span>
                  <span>${ticket.vaga}</span>
                </div>
                <div class="info-row">
                  <span>ENTRADA:</span>
                  <span>${dataEntrada}</span>
                </div>
                <div class="info-row">
                  <span>SAÍDA:</span>
                  <span>${dataSaida}</span>
                </div>
                <div class="info-row">
                  <span>TEMPO:</span>
                  <span>${ticket.tempo_total}</span>
                </div>
                <div class="divisor"></div>
                <div class="info-row total">
                  <span>VALOR TOTAL:</span>
                  <span>R$ ${ticket.valor.toFixed(2)}</span>
                </div>
                <div class="divisor"></div>
              </div>
              <div class="ticket-footer">
                <p>OBRIGADO PELA PREFERÊNCIA</p>
                <p>VOLTE SEMPRE!</p>
                <div class="ticket-numero">
                  #${ticket.vaga}-${new Date().getTime()}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 250);
    } else {
      resolve();
    }
  });
}; 