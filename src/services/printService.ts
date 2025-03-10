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
      const escposContent = this.generateESCPOS(data);
      const blob = new Blob([escposContent], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      
      if (/Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `intent://${url}#Intent;scheme=epson;package=com.epson.epos2_printer;end;`;
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'impressao.prn';
        a.click();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao imprimir via Epson:', error);
      return false;
    }
  }

  private async printViaShare(data: PrintData): Promise<boolean> {
    try {
      const pdfBlob = await this.generatePDFBlob(data);
      
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], 'ticket.pdf', { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Compartilhar Ticket',
          });
          return true;
        }
      }
      
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }

  private async printDirect(data: PrintData): Promise<boolean> {
    // Implementação futura para impressão direta
    return false;
  }

  private async generatePDF(data: PrintData): Promise<boolean> {
    try {
      const pdfBlob = await this.generatePDFBlob(data);
      const url = window.URL.createObjectURL(pdfBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  private async generatePDFBlob(data: PrintData): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });

    doc.setFontSize(10);
    
    const { empresa, ...ticketInfo } = data.content;
    
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.nome, 40, 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(empresa.endereco, 40, 15, { align: 'center' });
    doc.text(`Tel: ${empresa.telefone}`, 40, 20, { align: 'center' });
    if (empresa.cnpj) {
      doc.text(`CNPJ: ${empresa.cnpj}`, 40, 25, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKET DE ESTACIONAMENTO', 40, 35, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let y = 45;
    
    Object.entries(ticketInfo).forEach(([key, value]) => {
      if (key !== 'empresa') {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ') + ':';
        doc.text(label, 10, y);
        doc.text(String(value), 70, y, { align: 'right' });
        y += 5;
      }
    });

    doc.setFontSize(8);
    doc.text('Obrigado pela preferência!', 40, y + 10, { align: 'center' });

    return doc.output('blob');
  }

  private generateESCPOS(data: PrintData): Uint8Array {
    const encoder = new TextEncoder();
    let commands = '';
    
    const { empresa, ...ticketInfo } = data.content;
    
    commands += '\x1B\x40';
    commands += '\x1B\x61\x01';
    
    commands += '\x1B\x21\x08';
    commands += `${empresa.nome}\n`;
    commands += '\x1B\x21\x00';
    commands += `${empresa.endereco}\n`;
    commands += `Tel: ${empresa.telefone}\n`;
    if (empresa.cnpj) {
      commands += `CNPJ: ${empresa.cnpj}\n`;
    }
    commands += '\n';
    
    commands += '\x1B\x21\x10';
    commands += 'TICKET DE ESTACIONAMENTO\n\n';
    commands += '\x1B\x21\x00';
    
    commands += '\x1B\x61\x00';
    Object.entries(ticketInfo).forEach(([key, value]) => {
      if (key !== 'empresa') {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
        commands += `${label}: ${value}\n`;
      }
    });
    
    commands += '\n';
    commands += '\x1B\x61\x01';
    commands += '--------------------------------\n';
    commands += 'Obrigado pela preferência!\n';
    commands += '--------------------------------\n\n';
    
    commands += '\x1B\x69';
    
    return encoder.encode(commands);
  }
}

export const printService = PrintService.getInstance(); 