import jsPDF from 'jspdf';
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
    paperSize: '80mm'
  };

  private constructor() {}

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  async print(data: PrintData): Promise<boolean> {
    try {
      const options = { ...this.defaultOptions, ...data.options };
      
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
      console.error('Erro ao imprimir:', error);
      return false;
    }
  }

  private async printViaEpson(data: PrintData): Promise<boolean> {
    try {
      const escposCommands = this.generateESCPOS(data);
      // Implementar lógica de impressão Epson aqui
      return true;
    } catch (error) {
      console.error('Erro na impressão Epson:', error);
      return false;
    }
  }

  private async printViaShare(data: PrintData): Promise<boolean> {
    try {
      const pdfBlob = await this.generatePDFBlob(data);
      
      if ('share' in navigator) {
        const file = new File([pdfBlob], 'ticket.pdf', { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: 'Ticket de Estacionamento',
          text: 'Seu ticket de estacionamento'
        });
        return true;
      } else {
        // Fallback para download direto
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }

  private async printDirect(data: PrintData): Promise<boolean> {
    // Implementar impressão direta se necessário
    return false;
  }

  private async generatePDF(data: PrintData): Promise<boolean> {
    try {
      const pdfBlob = await this.generatePDFBlob(data);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  private async generatePDFBlob(data: PrintData): Promise<Blob> {
    // Definir dimensões do papel
    const width = data.options?.paperSize === '80mm' ? 226 : 595; // 80mm = 226pt, A4 = 595pt
    const height = data.options?.paperSize === '80mm' ? 400 : 842; // Altura ajustável para ticket

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [width, height]
    });

    // Configurar fonte e tamanho
    doc.setFont('helvetica');
    doc.setFontSize(10);

    const margin = 20;
    let yPos = margin;

    // Cabeçalho da empresa
    doc.setFontSize(12);
    doc.text(data.content.empresa.nome, width / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.text(data.content.empresa.endereco, width / 2, yPos, { align: 'center' });
    yPos += 12;

    if (data.content.empresa.telefone) {
      doc.text(`Tel: ${data.content.empresa.telefone}`, width / 2, yPos, { align: 'center' });
      yPos += 12;
    }

    if (data.content.empresa.cnpj) {
      doc.text(`CNPJ: ${data.content.empresa.cnpj}`, width / 2, yPos, { align: 'center' });
      yPos += 20;
    }

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, width - margin, yPos);
    yPos += 15;

    // Informações do ticket
    doc.setFontSize(11);
    doc.text('TICKET DE ESTACIONAMENTO', width / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(10);
    const infoLines = [
      ['Placa:', data.content.placa],
      ['Modelo:', data.content.modelo],
      ['Cor:', data.content.cor],
      ['Vaga:', data.content.vaga],
      ['Entrada:', data.content.entrada]
    ];

    infoLines.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, margin, yPos);
      yPos += 15;
    });

    // Linha divisória final
    yPos += 5;
    doc.line(margin, yPos, width - margin, yPos);
    yPos += 15;

    // Rodapé
    doc.setFontSize(9);
    doc.text('Obrigado pela preferência!', width / 2, yPos, { align: 'center' });

    return doc.output('blob');
  }

  private generateESCPOS(data: PrintData): Uint8Array {
    // Implementar geração de comandos ESC/POS se necessário
    return new Uint8Array();
  }
}

export const printService = PrintService.getInstance(); 