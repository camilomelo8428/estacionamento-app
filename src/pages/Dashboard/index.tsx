import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { financeiroService } from '../../services/financeiroService';
import { useError } from '../../contexts/ErrorContext';
import { toast } from 'react-toastify';
import { 
  SyncOutlined, 
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import './styles.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardData {
  faturamentoDiario: number;
  ticketsEmitidos: number;
  ticketsAtivos: number;
  mensalidadesEmAtraso: number;
}

interface ChartData {
  nome: string;
  valor: number;
}

const Dashboard: React.FC = () => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [dataInicio, setDataInicio] = useState(() => {
    const hoje = new Date();
    hoje.setHours(hoje.getHours() - 3); // Ajusta para GMT-3 (Horário de Brasília)
    return hoje.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => {
    const hoje = new Date();
    hoje.setHours(hoje.getHours() - 3); // Ajusta para GMT-3 (Horário de Brasília)
    return hoje.toISOString().split('T')[0];
  });
  const [dadosDashboard, setDadosDashboard] = useState<DashboardData>({
    faturamentoDiario: 0,
    ticketsEmitidos: 0,
    ticketsAtivos: 0,
    mensalidadesEmAtraso: 0
  });
  const [dadosFaturamento, setDadosFaturamento] = useState<ChartData[]>([]);
  const [dadosTickets, setDadosTickets] = useState<ChartData[]>([]);
  const [dadosOcupacao, setDadosOcupacao] = useState<ChartData[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar dados do dashboard com o período selecionado
      const dashboard = await financeiroService.buscarDadosDashboard(dataInicio, dataFim);
      setDadosDashboard(dashboard);

      // Carregar dados de faturamento mensal
      const faturamento = await financeiroService.buscarFaturamentoMensal();
      setDadosFaturamento(faturamento);

      // Carregar dados de distribuição de tickets
      const tickets = await financeiroService.buscarDistribuicaoTickets();
      setDadosTickets(tickets);

      // Carregar dados de ocupação
      const ocupacao = await financeiroService.buscarDadosOcupacao();
      setDadosOcupacao(ocupacao);

    } catch (error: any) {
      setError(error.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoSubmit = () => {
    carregarDados();
    toast.success('Dados atualizados com sucesso!');
  };

  const gerarRelatorio = async () => {
    try {
      setGerando(true);
      const pdfBase64 = await financeiroService.gerarRelatorioPDF(
        `${dataInicio}T00:00:00Z`,
        `${dataFim}T23:59:59Z`
      );

      // Criar link para download
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = `relatorio-financeiro-${dataInicio}-a-${dataFim}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Relatório gerado com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao gerar relatório');
    } finally {
      setGerando(false);
    }
  };

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Financeiro</h1>
        <div className="relatorio-container">
          <div className="periodo-container">
            <div className="data-group">
              <label>
                <CalendarOutlined /> Data Inicial:
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="data-input"
                max={dataFim}
              />
            </div>
            <div className="data-group">
              <label>
                <CalendarOutlined /> Data Final:
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="data-input"
                min={dataInicio}
              />
            </div>
            <button 
              onClick={handlePeriodoSubmit}
              className="btn-atualizar"
            >
              <SyncOutlined spin={loading} /> Atualizar Dados
            </button>
          </div>
          <button 
            onClick={gerarRelatorio}
            disabled={gerando}
            className="btn-gerar-relatorio"
          >
            <FileTextOutlined /> {gerando ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>
      
      <div className="cards-container">
        <div className="dashboard-card">
          <h3>Faturamento Diário</h3>
          <p>{formatarMoeda(dadosDashboard.faturamentoDiario)}</p>
        </div>
        <div className="dashboard-card">
          <h3>Tickets Emitidos</h3>
          <p>{dadosDashboard.ticketsEmitidos}</p>
        </div>
        <div className="dashboard-card">
          <h3>Tickets Ativos</h3>
          <p>{dadosDashboard.ticketsAtivos}</p>
        </div>
        <div className="dashboard-card">
          <h3>Mensalidades em Atraso</h3>
          <p>{dadosDashboard.mensalidadesEmAtraso}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Faturamento Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFaturamento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatarMoeda(value)} />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#8884d8" name="Faturamento" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Distribuição de Tickets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosTickets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value: number) => value} />
              <Legend />
              <Bar dataKey="valor" fill="#82ca9d" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Ocupação do Estacionamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosOcupacao}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
                nameKey="nome"
                label={({ name, percent }: { name: string; percent: number }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {dadosOcupacao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 