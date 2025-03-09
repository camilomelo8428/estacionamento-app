import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { multaService } from '../../services/multaService';
import './styles.css';

const ConfiguracoesMulta: React.FC = () => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [configuracao, setConfiguracao] = useState({
    id: '',
    percentual_multa: 2.00,
    percentual_juros_dia: 0.033
  });

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      setLoading(true);
      const response = await multaService.obterConfiguracao();
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Erro ao carregar configuração');
      }

      setConfiguracao(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfiguracao(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await multaService.atualizarConfiguracao(configuracao);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      alert('Configurações atualizadas com sucesso!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="configuracoes-multa">
      <h2>Configurações de Multa e Juros</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Percentual de Multa (%)</label>
          <input
            type="number"
            name="percentual_multa"
            value={configuracao.percentual_multa}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
          <small>Multa aplicada uma única vez quando o pagamento está em atraso</small>
        </div>

        <div className="form-group">
          <label>Percentual de Juros ao Dia (%)</label>
          <input
            type="number"
            name="percentual_juros_dia"
            value={configuracao.percentual_juros_dia}
            onChange={handleChange}
            step="0.001"
            min="0"
            required
          />
          <small>Juros aplicados por dia de atraso</small>
        </div>

        <div className="form-group">
          <button type="submit" className="btn-salvar">
            Salvar Configurações
          </button>
        </div>
      </form>

      <div className="exemplo-calculo">
        <h3>Exemplo de Cálculo</h3>
        <p>Para uma mensalidade de R$ 100,00 com 5 dias de atraso:</p>
        <ul>
          <li>Multa: R$ {(100 * (configuracao.percentual_multa / 100)).toFixed(2)}</li>
          <li>Juros: R$ {(100 * (configuracao.percentual_juros_dia / 100) * 5).toFixed(2)}</li>
          <li>Total: R$ {(100 + (100 * (configuracao.percentual_multa / 100)) + (100 * (configuracao.percentual_juros_dia / 100) * 5)).toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfiguracoesMulta; 