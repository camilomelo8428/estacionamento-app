import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface PrintOptions {
  method: 'direct' | 'epson' | 'pdf' | 'share';
  printerName?: string;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | '80mm';
}

export interface PrintData {
  type: 'ticket' | 'receipt' | 'report';
  content: any;
  options?: PrintOptions;
}

class PrintService {
  private static instance: PrintService;
  private defaultOptions: PrintOptions = {
    method: 'pdf',
    orientation: 'portrait',
    paperSize: 'A4'
  };

  private constructor() {}

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  async print(data: PrintData): Promise<boolean> {
    const options = { ...this.defaultOptions, ...data.options };

    try {
      switch (options.method) {
        case 'epson':
          return await this.printViaEpson(data);
        case 'share':
          return await this.printViaShare(data);
        case 'direct':
          return await this.printDirect(data);
        case 'pdf':
        default:
          return await this.generatePDF(data);
      }
    } catch (error) {
      console.error('Erro na impressão:', error);
      throw new Error('Falha ao imprimir documento');
    }
  }

  private async printViaEpson(data: PrintData): Promise<boolean> {
    try {
      // Gera o conteúdo em formato ESC/POS
      const escposContent = this.generateESCPOS(data);
      
      // Cria um Blob com o conteúdo
      const blob = new Blob([escposContent], { type: 'application/octet-stream' });
      
      // Cria URL para download/compartilhamento
      const url = window.URL.createObjectURL(blob);
      
      // Abre intent para o aplicativo Epson
      window.location.href = `intent://${url}#Intent;scheme=epson;package=com.epson.epos2_printer;end;`;
      
      return true;
    } catch (error) {
      console.error('Erro ao imprimir via Epson:', error);
      return false;
    }
  }

  private async printViaShare(data: PrintData): Promise<boolean> {
    try {
      // Gera PDF para compartilhamento
      const pdfBlob = await this.generatePDFBlob(data);
      
      if (navigator.share) {
        await navigator.share({
          files: [new File([pdfBlob], 'documento.pdf', { type: 'application/pdf' })]
        });
        return true;
      } else {
        // Fallback para download se compartilhamento não disponível
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documento.pdf';
        a.click();
        return true;
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }

  private async printDirect(data: PrintData): Promise<boolean> {
    // Implementação futura para impressão direta via WebUSB ou Bluetooth
    return false;
  }

  private async generatePDF(data: PrintData): Promise<boolean> {
    try {
      const pdfBlob = await this.generatePDFBlob(data);
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  private async generatePDFBlob(data: PrintData): Promise<Blob> {
    const doc = new jsPDF({
      orientation: data.options?.orientation || 'portrait',
      unit: 'mm',
      format: data.options?.paperSize || 'A4'
    });

    switch (data.type) {
      case 'ticket':
        this.formatTicket(doc, data.content);
        break;
      case 'receipt':
        this.formatReceipt(doc, data.content);
        break;
      case 'report':
        this.formatReport(doc, data.content);
        break;
    }

    return doc.output('blob');
  }

  private generateESCPOS(data: PrintData): Uint8Array {
    // Implementação da geração de comandos ESC/POS
    // Aqui você implementaria a lógica específica para sua impressora
    const encoder = new TextEncoder();
    let commands = '';

    switch (data.type) {
      case 'ticket':
        commands = this.formatTicketESCPOS(data.content);
        break;
      case 'receipt':
        commands = this.formatReceiptESCPOS(data.content);
        break;
      case 'report':
        commands = this.formatReportESCPOS(data.content);
        break;
    }

    return encoder.encode(commands);
  }

  private formatTicket(doc: jsPDF, content: any) {
    // Implementação da formatação do ticket em PDF
  }

  private formatReceipt(doc: jsPDF, content: any) {
    // Implementação da formatação do recibo em PDF
  }

  private formatReport(doc: jsPDF, content: any) {
    // Implementação da formatação do relatório em PDF
  }

  private formatTicketESCPOS(content: any): string {
    const { placa, modelo, cor, hora_entrada, vaga, empresa } = content;
    
    // Comandos ESC/POS para formatação do ticket
    let commands = '';
    
    // Inicialização
    commands += '\x1B\x40'; // Initialize printer
    commands += '\x1B\x61\x01'; // Center alignment
    
    // Cabeçalho
    commands += '\x1B\x21\x08'; // Emphasized mode
    commands += `${empresa.nome}\n`;
    commands += '\x1B\x21\x00'; // Normal mode
    commands += `${empresa.endereco}\n`;
    commands += `Tel: ${empresa.telefone}\n\n`;
    
    // Título
    commands += '\x1B\x21\x10'; // Double-height mode
    commands += 'TICKET DE ESTACIONAMENTO\n\n';
    commands += '\x1B\x21\x00'; // Normal mode
    
    // Informações do veículo
    commands += '\x1B\x61\x00'; // Left alignment
    commands += `Placa: ${placa}\n`;
    commands += `Modelo: ${modelo}\n`;
    commands += `Cor: ${cor}\n`;
    commands += `Vaga: ${vaga}\n`;
    commands += `Entrada: ${hora_entrada}\n\n`;
    
    // Rodapé
    commands += '\x1B\x61\x01'; // Center alignment
    commands += '--------------------------------\n';
    commands += 'Obrigado pela preferência!\n';
    commands += '--------------------------------\n\n';
    
    // Corte do papel
    commands += '\x1B\x69'; // Cut paper
    
    return commands;
  }

  private formatReceiptESCPOS(content: any): string {
    const { 
      placa, modelo, cor, vaga, hora_entrada, hora_saida,
      valor, tempo_total, empresa 
    } = content;
    
    // Comandos ESC/POS para formatação do recibo
    let commands = '';
    
    // Inicialização
    commands += '\x1B\x40'; // Initialize printer
    commands += '\x1B\x61\x01'; // Center alignment
    
    // Cabeçalho
    commands += '\x1B\x21\x08'; // Emphasized mode
    commands += `${empresa.nome}\n`;
    commands += '\x1B\x21\x00'; // Normal mode
    commands += `${empresa.endereco}\n`;
    commands += `Tel: ${empresa.telefone}\n`;
    if (empresa.cnpj) {
      commands += `CNPJ: ${empresa.cnpj}\n`;
    }
    commands += '\n';
    
    // Título
    commands += '\x1B\x21\x10'; // Double-height mode
    commands += 'RECIBO DE PAGAMENTO\n\n';
    commands += '\x1B\x21\x00'; // Normal mode
    
    // Informações do veículo
    commands += '\x1B\x61\x00'; // Left alignment
    commands += `Placa: ${placa}\n`;
    commands += `Modelo: ${modelo}\n`;
    commands += `Cor: ${cor}\n`;
    commands += `Vaga: ${vaga}\n`;
    commands += `Entrada: ${hora_entrada}\n`;
    commands += `Saída: ${hora_saida}\n`;
    commands += `Tempo total: ${tempo_total}\n\n`;
    
    // Valor
    commands += '\x1B\x61\x01'; // Center alignment
    commands += '\x1B\x21\x08'; // Emphasized mode
    commands += 'VALOR TOTAL\n';
    commands += `R$ ${valor.toFixed(2)}\n\n`;
    commands += '\x1B\x21\x00'; // Normal mode
    
    // Rodapé
    commands += '--------------------------------\n';
    commands += 'Obrigado pela preferência!\n';
    commands += '--------------------------------\n\n';
    
    // Corte do papel
    commands += '\x1B\x69'; // Cut paper
    
    return commands;
  }

  private formatReportESCPOS(content: any): string {
    // Relatórios geralmente são muito grandes para impressoras térmicas
    // Recomendamos usar apenas PDF para relatórios
    return '';
  }
}

export const printService = PrintService.getInstance(); 