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
      return true;
    } catch (error) {
      console.error('Erro na impressão Epson:', error);
      return false;
    }
  }

  private async printViaShare(data: PrintData): Promise<boolean> {
    try {
      // Gerar PDF como base64 string
      const doc = this.createPDFDocument(data);
      const pdfBase64 = doc.output('datauristring');

      // Criar Blob a partir do base64
      const base64Data = pdfBase64.split(',')[1];
      const binaryData = atob(base64Data);
      const byteArray = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        byteArray[i] = binaryData.charCodeAt(i);
      }
      const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

      if ('share' in navigator) {
        const file = new File([pdfBlob], 'ticket.pdf', { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: 'Ticket de Estacionamento',
          text: 'Seu ticket de estacionamento'
        });
        return true;
      } else {
        // Fallback: Abrir em nova aba
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
        return true;
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        // Usuário cancelou o compartilhamento
        return true;
      }
      return false;
    }
  }

  private async printDirect(data: PrintData): Promise<boolean> {
    return false;
  }

  private async generatePDF(data: PrintData): Promise<boolean> {
    try {
      const doc = this.createPDFDocument(data);
      const pdfBase64 = doc.output('datauristring');
      
      // Criar iframe temporário para exibir o PDF
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfBase64;
      document.body.appendChild(iframe);

      // Remover iframe após carregar
      iframe.onload = () => {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      };

      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  private createPDFDocument(data: PrintData): jsPDF {
    // Definir dimensões do papel
    const width = 210; // Largura A4 em mm
    const height = 297; // Altura A4 em mm

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [width, height]
    });

    // Configurar fonte
    doc.setFont('helvetica');
    doc.setFontSize(12);

    const margin = 20;
    let yPos = margin;

    // Cabeçalho da empresa
    doc.setFontSize(16);
    doc.text(data.content.empresa.nome, width / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.text(data.content.empresa.endereco, width / 2, yPos, { align: 'center' });
    yPos += 8;

    if (data.content.empresa.telefone) {
      doc.text(`Tel: ${data.content.empresa.telefone}`, width / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    if (data.content.empresa.cnpj) {
      doc.text(`CNPJ: ${data.content.empresa.cnpj}`, width / 2, yPos, { align: 'center' });
      yPos += 15;
    }

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, width - margin, yPos);
    yPos += 10;

    // Título do ticket
    doc.setFontSize(14);
    doc.text('TICKET DE ESTACIONAMENTO', width / 2, yPos, { align: 'center' });
    yPos += 15;

    // Informações do ticket
    doc.setFontSize(12);
    const infoLines = [
      ['Placa:', data.content.placa],
      ['Modelo:', data.content.modelo],
      ['Cor:', data.content.cor],
      ['Vaga:', data.content.vaga],
      ['Entrada:', data.content.entrada]
    ];

    infoLines.forEach(([label, value]) => {
      const text = `${label} ${value}`;
      doc.text(text, width / 2, yPos, { align: 'center' });
      yPos += 8;
    });

    // Linha divisória final
    yPos += 5;
    doc.line(margin, yPos, width - margin, yPos);
    yPos += 10;

    // Rodapé
    doc.setFontSize(10);
    doc.text('Obrigado pela preferência!', width / 2, yPos, { align: 'center' });

    return doc;
  }

  private generateESCPOS(data: PrintData): Uint8Array {
    return new Uint8Array();
  }
}

export const printService = PrintService.getInstance(); 