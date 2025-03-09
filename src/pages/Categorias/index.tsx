import React, { useState, useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { categoriasService } from '../../services/categoriasService';
import './styles.css';

interface Categoria {
  id: string;
  nome: string;
  preco_hora: number;
  preco_dia: number;
  preco_mes: number;
  vagas: number;
}

interface CategoriaForm {
  nome: string;
  preco_hora: number;
  preco_dia: number;
  preco_mes: number;
  vagas: number;
}

const Categorias: React.FC = () => {
  const { setError } = useError();
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<CategoriaForm>({
    nome: '',
    preco_hora: 0,
    preco_dia: 0,
    preco_mes: 0,
    vagas: 0
  });

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriasService.listarCategorias();
      if (response.success) {
        setCategorias(response.data);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleEdit = (categoria: Categoria) => {
    setCategoriaEdit(categoria);
    setFormData({
      nome: categoria.nome,
      preco_hora: categoria.preco_hora,
      preco_dia: categoria.preco_dia,
      preco_mes: categoria.preco_mes,
      vagas: categoria.vagas
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        const response = await categoriasService.excluirCategoria(id);
        if (response.success) {
          await carregarCategorias();
        } else {
          setError(response.message);
        }
      } catch (error: any) {
        setError(error.message || 'Erro ao excluir categoria');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (categoriaEdit) {
        // Se o número de vagas foi alterado, usar atualizarLimiteVagas
        if (formData.vagas !== categoriaEdit.vagas) {
          const limiteResponse = await categoriasService.atualizarLimiteVagas(categoriaEdit.id, formData.vagas);
          if (!limiteResponse.success) {
            setError(limiteResponse.message);
            return;
          }
        }

        // Atualizar outros dados da categoria
        const dadosAtualizados = {
          nome: formData.nome,
          preco_hora: formData.preco_hora,
          preco_dia: formData.preco_dia,
          preco_mes: formData.preco_mes
        };

        const response = await categoriasService.atualizarCategoria(categoriaEdit.id, dadosAtualizados);
        if (response.success) {
          await carregarCategorias();
          handleCloseModal();
        } else {
          setError(response.message);
        }
      } else {
        // Criando nova categoria
        const response = await categoriasService.criarCategoria(formData);
        if (response.success) {
          await carregarCategorias();
          handleCloseModal();
        } else {
          setError(response.message);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar categoria');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCategoriaEdit(null);
    setFormData({
      nome: '',
      preco_hora: 0,
      preco_dia: 0,
      preco_mes: 0,
      vagas: 0
    });
  };

  const formatarValor = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="categorias-container">
      <div className="categorias-header">
        <h1>Gerenciar Categorias</h1>
        <button className="btn-nova-categoria" onClick={() => setShowModal(true)}>
          Nova Categoria
        </button>
      </div>

      <div className="table-container">
        <table className="categorias-table">
          <thead>
            <tr>
              <th>Ações</th>
              <th>Nome</th>
              <th>Preço por hora</th>
              <th>Preço por dia</th>
              <th>Preço por mês</th>
              <th>Vagas</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(categoria => (
              <tr key={categoria.id}>
                <td className="actions-cell">
                  <button 
                    className="btn-editar"
                    onClick={() => handleEdit(categoria)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn-excluir"
                    onClick={() => handleDelete(categoria.id)}
                  >
                    Excluir
                  </button>
                </td>
                <td>{categoria.nome}</td>
                <td>R$ {formatarValor(categoria.preco_hora)}</td>
                <td>R$ {formatarValor(categoria.preco_dia)}</td>
                <td>R$ {formatarValor(categoria.preco_mes)}</td>
                <td>{categoria.vagas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{categoriaEdit ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            
            <div className="info-box">
              <h3>Exemplos de preenchimento dos valores:</h3>
              <ul>
                <li>Para R$ 8,00 informe 8</li>
                <li>Para R$ 18,99 informe 18.99</li>
                <li>Para R$ 100,00 informe 100</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome da Categoria</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Veículos pequenos"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço por Hora (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_hora}
                    onChange={e => setFormData({ ...formData, preco_hora: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço por Dia (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_dia}
                    onChange={e => setFormData({ ...formData, preco_dia: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço por Mês (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_mes}
                    onChange={e => setFormData({ ...formData, preco_mes: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Quantidade de Vagas</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.vagas}
                    onChange={e => setFormData({ ...formData, vagas: parseInt(e.target.value) || 0 })}
                    required
                    placeholder="Ex: 30"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-salvar">
                  {categoriaEdit ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
                <button type="button" className="btn-cancelar" onClick={handleCloseModal}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorias; 