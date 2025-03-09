const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

// Configurações do PDF
const options = {
    cssPath: path.join(__dirname, 'manual_styles.css'),
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    paperBorder: '20mm',
    renderDelay: 2000,
    runningsPath: path.join(__dirname, 'headers.js'),
    remarkable: {
        html: true,
        breaks: true,
        plugins: ['remarkable-meta']
    }
};

// Função para gerar o PDF
function gerarManualPDF() {
    console.log('Iniciando geração do PDF...');

    markdownpdf(options)
        .from(path.join(__dirname, 'manual_sistema.md'))
        .to(path.join(__dirname, 'Manual_Sistema_Estacionamento.pdf'), function () {
            console.log('PDF gerado com sucesso!');
        });
}

// Gerar cabeçalho e rodapé
const headers = `
module.exports = {
    header: {
        height: '20mm',
        contents: '<div style="text-align: right; font-size: 10px;">Sistema de Gerenciamento de Estacionamento - Manual v1.2</div>'
    },
    footer: {
        height: '20mm',
        contents: {
            default: '<div style="text-align: center; font-size: 10px;">Página {{page}} de {{pages}}</div>'
        }
    }
};
`;

fs.writeFileSync(path.join(__dirname, 'headers.js'), headers);

// Executar geração
gerarManualPDF(); 