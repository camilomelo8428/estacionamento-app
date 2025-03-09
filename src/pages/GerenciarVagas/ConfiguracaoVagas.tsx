import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';
import AjustarLimiteVagas from './AjustarLimiteVagas';
import './styles.css';

interface Categoria {
  id: string;
  nome: string;
  vagas: number;
  vagasOcupadas?: number;
}

interface ConfiguracaoVagasProps {
  onClose: () => void;
  onUpdate: () => void;
}

const ConfiguracaoVagas: React.FC<ConfiguracaoVagasProps> = ({ onClose, onUpdate }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaParaAjuste, setCategoriaParaAjuste] = useState<Categoria | null>(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, nome, vagas')
        .order('nome');

      if (categoriasError) throw categoriasError;

      // Para cada categoria, buscar número de vagas ocupadas
      const categoriasComOcupacao = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await supabase
            .from('vagas')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoria.id)
            .eq('status', 'OCUPADA');

          if (countError) throw countError;

          return {
            ...categoria,
            vagasOcupadas: count || 0
          };
        })
      );

      setCategorias(categoriasComOcupacao);
    } catch (error: any) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAjustarLimite = (categoria: Categoria) => {
    setCategoriaParaAjuste(categoria);
  };

  const handleAjusteSucesso = () => {
    carregarCategorias();
    onUpdate();
  };

  if (loading) {
    return (
      <div className="configuracao-vagas-modal">
        <div className="modal-content">
          <h2>Carregando...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="configuracao-vagas-modal">
      <div className="modal-content">
        <h2>Configurar Quantidade de Vagas</h2>
        
        <div className="categorias-list">
          {categorias.map(categoria => (
            <div key={categoria.id} className="categoria-item">
              <div className="categoria-info">
                <label>{categoria.nome}</label>
                {categoria.vagasOcupadas ? (
                  <span className="vagas-ocupadas">
                    ({categoria.vagasOcupadas} vagas ocupadas)
                  </span>
                ) : null}
              </div>
              <div className="input-group">
                <span className="vagas-total">
                  Total: {categoria.vagas} vagas
                </span>
                <button
                  className="btn-ajustar"
                  onClick={() => handleAjustarLimite(categoria)}
                  disabled={loading}
                >
                  Ajustar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button 
            className="btn-fechar" 
            onClick={onClose}
            disabled={loading}
          >
            Fechar
          </button>
        </div>
      </div>

      {categoriaParaAjuste && (
        <AjustarLimiteVagas
          categoriaId={categoriaParaAjuste.id}
          categoriaAtual={categoriaParaAjuste}
          onClose={() => setCategoriaParaAjuste(null)}
          onSuccess={handleAjusteSucesso}
        />
      )}
    </div>
  );
};

export default ConfiguracaoVagas; 