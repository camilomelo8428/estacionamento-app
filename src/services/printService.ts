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

  async print(data: PrintData): Promise<boolean> {
    try {
      const doc = this.createPDFDocument(data);
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Em dispositivos móveis, abrir em nova aba para usar o visualizador nativo
      window.open(pdfUrl, '_blank');
      
      // Limpar a URL após um breve delay
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

      return true;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return false;
    }
  }

  private createPDFDocument(data: PrintData): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurar fonte
    doc.setFont('helvetica');
    
    // Calcular margens e largura útil
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const usableWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Cabeçalho da empresa
    doc.setFontSize(16);
    doc.text(data.content.empresa.nome, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    const enderecoLines = doc.splitTextToSize(data.content.empresa.endereco, usableWidth);
    doc.text(enderecoLines, pageWidth / 2, yPos, { align: 'center' });
    yPos += (enderecoLines.length * 6) + 4;

    if (data.content.empresa.telefone) {
      doc.text(`Tel: ${data.content.empresa.telefone}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    }

    if (data.content.empresa.cnpj) {
      doc.text(`CNPJ: ${data.content.empresa.cnpj}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;
    }

    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Título do ticket
    doc.setFontSize(14);
    doc.text('TICKET DE ESTACIONAMENTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Informações do ticket em formato de tabela
    doc.setFontSize(12);
    const tableData = [
      ['Placa', data.content.placa],
      ['Modelo', data.content.modelo],
      ['Cor', data.content.cor],
      ['Vaga', data.content.vaga],
      ['Entrada', data.content.entrada]
    ];

    // Configurar a tabela
    (doc as any).autoTable({
      startY: yPos,
      head: [],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 12,
        cellPadding: 5,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin }
    });

    // Obter a posição Y final da tabela
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Linha divisória final
    doc.line(margin, finalY, pageWidth - margin, finalY);

    // Rodapé
    doc.setFontSize(10);
    doc.text('Obrigado pela preferência!', pageWidth / 2, finalY + 10, { align: 'center' });

    return doc;
  }
}

export const printService = PrintService.getInstance(); 