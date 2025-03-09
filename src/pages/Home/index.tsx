import React, { useEffect, useState } from 'react';
import { useVagas } from '../../contexts/VagasContext';
import { financeiroService } from '../../services/financeiroService';
import { mensalidadesService } from '../../services/mensalidadesService';
import { supabase } from '../../services/supabase';
import './styles.css';

const Home: React.FC = () => {
  const { vagas, loading: vagasLoading, error: vagasError, listarVagas, ocuparVaga, liberarVaga } = useVagas();
  const [placa, setPlaca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    mensalidadesEmAtraso: 0
  });
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string; vagas: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarVagas();
    carregarDados();
  }, [listarVagas]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Carregar categorias para calcular capacidade total
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, nome, vagas');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Verificar e atualizar mensalidades em atraso
      await mensalidadesService.verificarMensalidadesEmAtraso();
      
      const dados = await financeiroService.buscarDadosDashboard();
      setDashboardData(dados);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleOcuparVaga = async (id: string) => {
    if (!placa.trim()) {
      alert('Por favor, insira a placa do veículo');
      return;
    }
    await ocuparVaga(id, placa);
    setPlaca('');
    setVagaSelecionada(null);
  };

  const vagasOcupadas = vagas.filter(vaga => vaga.status === 'OCUPADA');
  const ticketsFinalizados = vagas.filter(vaga => vaga.hora_saida).length;
  const capacidadeTotal = categorias.reduce((total, categoria) => total + categoria.vagas, 0);

  const cards = [
    {
      title: 'Veículos estacionados',
      value: vagasOcupadas.length,
      color: 'primary'
    },
    {
      title: 'Tickets finalizados',
      value: ticketsFinalizados,
      color: 'success'
    },
    {
      title: 'Capacidade de vagas',
      value: capacidadeTotal,
      color: 'info'
    },
    {
      title: 'Mensalidades em atraso',
      value: dashboardData.mensalidadesEmAtraso,
      color: 'danger'
    }
  ];

  if (vagasLoading || loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (vagasError || error) {
    return <div className="error">{vagasError || error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        {cards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <div className="stat-value">{card.value}</div>
              <button className="btn-gerenciar">Gerenciar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h2>Atividade Recente</h2>
        <div className="activity-list">
          {vagasOcupadas.map((vaga) => (
            <div key={vaga.id} className="activity-item">
              <div className="activity-icon">🚗</div>
              <div className="activity-details">
                <h4>Vaga {vaga.numero}</h4>
                <p>Placa: {vaga.placa}</p>
                <p className="activity-time">
                  Entrada: {new Date(vaga.hora_entrada!).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 