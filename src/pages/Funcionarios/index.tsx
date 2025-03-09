import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { funcionariosService } from '../../services/funcionariosService';
import { Database } from '../../types/supabase';
import './styles.css';

type Funcionario = Database['public']['Tables']['funcionarios']['Row'];

interface NovoFuncionario {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: 'ADMINISTRADOR' | 'OPERADOR';
  cpf?: string;
  telefone?: string;
  cargo?: string;
}

const Funcionarios: React.FC = () => {
  const { user } = useAuth();
  const { setError } = useError();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [formError, setFormError] = useState('');

  const [novoFuncionario, setNovoFuncionario] = useState<NovoFuncionario>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'OPERADOR'
  });

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const response = await funcionariosService.listarFuncionarios();
      if (response.success) {
        setFuncionarios(response.data);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoFuncionario(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError(''); // Limpa o erro quando o usuário começa a digitar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validações básicas do formulário
    if (!novoFuncionario.nome || !novoFuncionario.email || !novoFuncionario.senha) {
      setFormError('Todos os campos são obrigatórios');
      return;
    }

    if (novoFuncionario.senha !== novoFuncionario.confirmarSenha) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (novoFuncionario.senha.length < 6) {
      setFormError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Iniciando criação de funcionário...'); // Log para debug

      const response = await funcionariosService.criarFuncionario({
        nome: novoFuncionario.nome,
        email: novoFuncionario.email,
        tipo: novoFuncionario.tipo,
        cpf: novoFuncionario.cpf || '',
        telefone: novoFuncionario.telefone || '',
        cargo: novoFuncionario.cargo || 'Funcionário',
        senha: novoFuncionario.senha
      });

      console.log('Resposta do serviço:', response); // Log para debug

      if (response.success) {
        await carregarFuncionarios();
        setShowModal(false);
        setNovoFuncionario({
          nome: '',
          email: '',
          senha: '',
          confirmarSenha: '',
          tipo: 'OPERADOR'
        });
        setError('Funcionário criado com sucesso!'); // Feedback positivo
      } else {
        setFormError(response.message);
      }
    } catch (error: any) {
      console.error('Erro ao criar funcionário:', error); // Log para debug
      setFormError(error.message || 'Erro ao criar funcionário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, ativo: boolean) => {
    try {
      console.log('Alterando status do funcionário:', { id, novoStatus: !ativo });
      
      const response = await funcionariosService.alterarStatus(id, !ativo);
      console.log('Resposta do serviço:', response);
      
      if (response.success) {
        await carregarFuncionarios();
        setError(`Funcionário ${!ativo ? 'ativado' : 'desativado'} com sucesso`);
      } else {
        console.error('Erro na resposta do serviço:', response.message);
        setError(response.message);
      }
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      setError(error.message || 'Erro ao alterar status do funcionário');
    }
  };

  const handleRemover = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este funcionário permanentemente?')) {
      return;
    }

    try {
      const response = await funcionariosService.removerFuncionario(id);
      
      if (response.success) {
        await carregarFuncionarios();
        setError('Funcionário removido com sucesso');
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      console.error('Erro ao remover funcionário:', error);
      setError(error.message || 'Erro ao remover funcionário');
    }
  };

  if (user?.role !== 'ADMINISTRADOR') {
    return <div className="acesso-negado">Acesso não autorizado</div>;
  }

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="funcionarios-container">
      <div className="funcionarios-header">
        <h1>Gerenciar Funcionários</h1>
        <button className="btn-novo-funcionario" onClick={() => setShowModal(true)}>
          <span>+</span>
          Novo Funcionário
        </button>
      </div>

      <div className="table-container">
        <table className="funcionarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(funcionario => (
              <tr key={funcionario.id}>
                <td>{funcionario.nome}</td>
                <td>{funcionario.email}</td>
                <td>{funcionario.tipo === 'ADMINISTRADOR' ? 'Administrador' : 'Operador'}</td>
                <td>
                  <span className={`status-badge ${funcionario.ativo ? 'ativo' : 'inativo'}`}>
                    {funcionario.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
                <td>{new Date(funcionario.created_at!).toLocaleDateString('pt-BR')}</td>
                <td className="acoes-funcionario">
                  <button
                    className="btn-desativar"
                    onClick={() => handleStatusChange(funcionario.id, funcionario.ativo)}
                  >
                    {funcionario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className="btn-remover"
                    onClick={() => handleRemover(funcionario.id)}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Novo Funcionário</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome completo</label>
                <input
                  type="text"
                  name="nome"
                  value={novoFuncionario.nome}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={novoFuncionario.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o e-mail"
                />
              </div>

              <div className="form-group">
                <label>Tipo de usuário</label>
                <select
                  name="tipo"
                  value={novoFuncionario.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={novoFuncionario.senha}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite a senha"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirmar senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={novoFuncionario.confirmarSenha}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirme a senha"
                  minLength={6}
                />
              </div>

              {formError && <div className="error-message">{formError}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-salvar" disabled={submitting}>
                  {submitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
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

export default Funcionarios; 