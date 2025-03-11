import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Spin } from 'antd';
import { 
  CarOutlined,
  LoadingOutlined,
  CarFilled,
  RocketOutlined,
  ThunderboltOutlined,
  BankOutlined,
  TruckOutlined,
  CarTwoTone,
  SafetyCertificateOutlined,
  ThunderboltFilled
} from '@ant-design/icons';
import './styles.css';

interface Vaga {
  id: number;
  numero: string;
  status: 'LIVRE' | 'OCUPADA';
  categoria_id: number;
}

interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  vagas: Vaga[];
}

const ordemCategorias = ['Veículos pequenos', 'Veículos Grandes', 'Veículos especiais', 'Motos'];

const getIconeCategoria = (nome: string) => {
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes('pequenos')) {
    return <CarTwoTone twoToneColor="#52c41a" style={{ fontSize: '24px' }} />;
  }
  if (nomeLower.includes('grandes')) {
    return <TruckOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
  }
  if (nomeLower.includes('especiais')) {
    return <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#722ed1' }} />;
  }
  if (nomeLower.includes('motos')) {
    return <ThunderboltFilled style={{ fontSize: '24px', color: '#fa8c16' }} />;
  }
  return <CarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
};

const getTipoCategoria = (nome: string): string => {
  const nomeLower = nome.toLowerCase();
  if (nomeLower.includes('pequenos')) return 'pequenos';
  if (nomeLower.includes('grandes')) return 'grandes';
  if (nomeLower.includes('especiais')) return 'especiais';
  if (nomeLower.includes('motos')) return 'motos';
  return 'outros';
};

const StatusVagas: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      // Buscar categorias com suas vagas em uma única consulta
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          *,
          vagas (
            id,
            numero,
            status,
            categoria_id
          )
        `)
        .order('nome');

      if (categoriasError) throw categoriasError;

      // Transformar os dados para o formato esperado
      const categoriasProcessadas = (categoriasData || []).map((categoria) => ({
        ...categoria,
        vagas: categoria.vagas || []
      }));

      // Ordenar categorias conforme a ordem definida
      const categoriasOrdenadas = categoriasProcessadas.sort((a, b) => {
        const indexA = ordemCategorias.indexOf(a.nome);
        const indexB = ordemCategorias.indexOf(b.nome);
        return indexA - indexB;
      });

      setCategorias(categoriasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    // Carregar dados iniciais
    carregarDados();

    // Inscrever-se para atualizações da tabela vagas
    const subscription = supabase
      .channel('vagas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vagas'
        },
        () => {
          // Recarregar dados quando houver alterações
          carregarDados();
        }
      )
      .subscribe();

    // Atualização periódica como fallback
    const interval = setInterval(carregarDados, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="status-vagas-container">
      <div className="status-header">
        <h1>Status das Vagas</h1>
        <div className="legenda">
          <div className="legenda-item">
            <div className="legenda-cor livre" />
            <span>Disponível</span>
          </div>
          <div className="legenda-item">
            <div className="legenda-cor ocupada" />
            <span>Ocupada</span>
          </div>
        </div>
      </div>

      <div className="categorias-grid">
        {categorias.map((categoria) => {
          const vagasDisponiveis = categoria.vagas.filter((vaga) => vaga.status === 'LIVRE').length;
          const totalVagas = categoria.vagas.length;
          const tipoCategoria = getTipoCategoria(categoria.nome);

          return (
            <div key={categoria.id} className="categoria-section" data-tipo={tipoCategoria}>
              <div className="categoria-header">
                <div className="categoria-titulo">
                  <div className="categoria-icone">
                    {getIconeCategoria(categoria.nome)}
                  </div>
                  <h2>{categoria.nome}</h2>
                </div>
                <div className="categoria-info">
                  <span className="info-disponivel">
                    {vagasDisponiveis} vagas disponíveis
                  </span>
                  <span className="info-total">
                    Total: {totalVagas} vagas
                  </span>
                </div>
              </div>

              <div className="vagas-grid">
                {categoria.vagas
                  .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                  .map((vaga) => (
                    <div
                      key={vaga.id}
                      className={`vaga-item ${vaga.status.toLowerCase()}`}
                    >
                      {vaga.numero}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusVagas; 