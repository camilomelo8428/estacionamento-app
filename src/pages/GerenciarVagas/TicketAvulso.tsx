import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { PrinterOutlined } from '@ant-design/icons';
import { imprimirTicket } from '../../utils/printUtils';
import './styles.css';

interface TicketAvulsoProps {
  numeroVaga: string;
  onClose: () => void;
  onSave: (dados: {
    placa: string;
    modelo: string;
    cor: string;
    numeroVaga: string;
    categoria: 'PEQUENO' | 'GRANDE' | 'ESPECIAL' | 'MOTO';
  }) => Promise<void>;
}

const TicketAvulso: React.FC<TicketAvulsoProps> = ({ numeroVaga, onClose, onSave }) => {
  const { setError } = useError();
  const { dadosEmpresa } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    placa: '',
    modelo: '',
    cor: '',
    numeroVaga,
    categoria: 'PEQUENO' as 'PEQUENO' | 'GRANDE' | 'ESPECIAL' | 'MOTO'
  });

  const handleImprimir = () => {
    return new Promise<void>((resolve) => {
      const ticketData = {
        placa: dados.placa,
        modelo: dados.modelo,
        cor: dados.cor,
        hora_entrada: new Date().toISOString(),
        vaga: numeroVaga
      };

      const empresaData = {
        nome: dadosEmpresa?.nome || 'Estacionamento',
        endereco: dadosEmpresa?.endereco || '',
        telefone: dadosEmpresa?.telefone || '',
        cnpj: dadosEmpresa?.cnpj || ''
      };

      imprimirTicket(ticketData, empresaData).then(resolve);
    });
  };

  useEffect(() => {
    buscarCategoria();
  }, []);

  const buscarCategoria = async () => {
    try {
      const categoria = numeroVaga.startsWith('P') ? 'PEQUENO' :
                       numeroVaga.startsWith('G') ? 'GRANDE' :
                       numeroVaga.startsWith('E') ? 'ESPECIAL' : 'MOTO';
      setDados(prev => ({ ...prev, categoria }));
    } catch (error: any) {
      setError(error.message || 'Erro ao buscar categoria da vaga');
    }
  };

  const formatarPlaca = (valor: string) => {
    valor = valor.toUpperCase();
    valor = valor.replace(/[^A-Z0-9]/g, '');
    
    if (valor.length <= 3) {
      return valor;
    } else if (valor.length <= 4) {
      return valor.slice(0, 3) + valor.slice(3);
    } else {
      return valor.slice(0, 3) + '-' + valor.slice(3, 7);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'placa') {
      setDados(prev => ({ ...prev, [name]: formatarPlaca(value) }));
    } else {
      setDados(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(dados);
      await handleImprimir(); // Aguardar a impressão ser concluída
      onClose(); // Fechar o modal após a impressão
    } catch (error: any) {
      setError(error.message || 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Novo Ticket Avulso</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="placa">Placa</label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={dados.placa}
                onChange={handleChange}
                placeholder="ABC-1234"
                maxLength={8}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="modelo">Modelo</label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={dados.modelo}
                onChange={handleChange}
                placeholder="Ex: Fiat Uno"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cor">Cor</label>
              <input
                type="text"
                id="cor"
                name="cor"
                value={dados.cor}
                onChange={handleChange}
                placeholder="Ex: Branco"
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar e Imprimir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketAvulso; 