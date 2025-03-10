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
    paperSize: 'A4'
  };

  private constructor() {}

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  async print(data: PrintData): Promise<{ url?: string; blob?: Blob }> {
    try {
      const doc = this.createPDFDocument(data);
      const pdfBlob = doc.output('blob');
      
      // Verificar se está em dispositivo móvel
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isMobile && 'share' in navigator) {
        // Criar arquivo para compartilhamento
        const file = new File([pdfBlob], 'ticket.pdf', { type: 'application/pdf' });
        return { blob: pdfBlob };
      } else {
        // Em desktop, retornar URL para download
        const pdfUrl = URL.createObjectURL(pdfBlob);
        return { url: pdfUrl, blob: pdfBlob };
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF');
    }
  }

  private createPDFDocument(data: PrintData): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150] // Formato de ticket térmico padrão
    });

    // Configurar fonte
    doc.setFont('helvetica');
    
    // Calcular margens e largura útil
    const pageWidth = doc.internal.pageSize.width;
    const margin = 5;
    const usableWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Cabeçalho da empresa
    doc.setFontSize(12);
    doc.text(data.content.empresa.nome, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    doc.setFontSize(8);
    const enderecoLines = doc.splitTextToSize(data.content.empresa.endereco, usableWidth);
    doc.text(enderecoLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (enderecoLines.length * 4) + 2;

    if (data.content.empresa.telefone) {
      doc.text(`Tel: ${data.content.empresa.telefone}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
    }

    if (data.content.empresa.cnpj) {
      doc.text(`CNPJ: ${data.content.empresa.cnpj}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }

    // Linha divisória
    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    // Título do ticket
    doc.setFontSize(10);
    doc.text('TICKET DE ESTACIONAMENTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Informações do ticket
    doc.setFontSize(8);
    const infoConfig = [
      { label: 'Placa:', value: data.content.placa },
      { label: 'Modelo:', value: data.content.modelo },
      { label: 'Cor:', value: data.content.cor },
      { label: 'Vaga:', value: data.content.vaga },
      { label: 'Entrada:', value: data.content.entrada }
    ];

    infoConfig.forEach(info => {
      doc.text(`${info.label} ${info.value}`, margin, yPos);
      yPos += 5;
    });

    // Linha divisória final
    yPos += 2;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    // Rodapé
    doc.setFontSize(8);
    doc.text('Obrigado pela preferência!', pageWidth / 2, yPos, { align: 'center' });

    return doc;
  }
}

export const printService = PrintService.getInstance(); 