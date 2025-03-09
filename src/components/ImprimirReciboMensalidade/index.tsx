import React from 'react';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { imprimirRecibo } from '../../utils/printUtils';
import './styles.css';

interface ImprimirReciboMensalidadeProps {
  mensalidade: {
    id: string;
    mensalista: {
      nome: string;
      cpf: string | null;
    };
    data_vencimento: string | null;
    data_pagamento: string | null;
    valor: number | null;
    valor_multa: number | null;
    valor_juros: number | null;
    valor_total: number | null;
  };
}

const ImprimirReciboMensalidade: React.FC<ImprimirReciboMensalidadeProps> = ({ mensalidade }) => {
  const { dadosEmpresa } = useEmpresa();

  const handleImprimir = () => {
    if (!dadosEmpresa) return;

    const reciboData = {
      valor: mensalidade.valor_total || 0,
      cliente: mensalidade.mensalista.nome,
      cpf: mensalidade.mensalista.cpf,
      dataVencimento: mensalidade.data_vencimento,
      dataPagamento: mensalidade.data_pagamento,
      valorBase: mensalidade.valor || 0,
      valorMulta: mensalidade.valor_multa || 0,
      valorJuros: mensalidade.valor_juros || 0,
      numeroRecibo: `REC${mensalidade.id.substring(0, 8).toUpperCase()}`
    };

    const empresaData = {
      nome: dadosEmpresa.nome,
      endereco: dadosEmpresa.endereco || '',
      telefone: dadosEmpresa.telefone || '',
      cnpj: dadosEmpresa.cnpj || ''
    };

    imprimirRecibo(reciboData, empresaData);
  };

  return (
    <div className="recibo-mensalidade-impressao">
      <button className="btn-imprimir" onClick={handleImprimir}>
        Imprimir Recibo
      </button>
    </div>
  );
};

export default ImprimirReciboMensalidade; 