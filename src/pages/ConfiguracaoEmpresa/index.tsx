import React, { useState, useEffect } from 'react';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { empresaService } from '../../services/empresaService';
import { toast } from 'react-toastify';
import './styles.css';

const ConfiguracaoEmpresa: React.FC = () => {
  const { dadosEmpresa, atualizarDadosEmpresa } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    qr_code_pix: '',
    chave_pix: '',
    nome_beneficiario_pix: '',
    cidade_beneficiario_pix: ''
  });

  useEffect(() => {
    if (dadosEmpresa) {
      setFormData({
        nome: dadosEmpresa.nome || '',
        cnpj: dadosEmpresa.cnpj || '',
        endereco: dadosEmpresa.endereco || '',
        telefone: dadosEmpresa.telefone || '',
        email: dadosEmpresa.email || '',
        qr_code_pix: dadosEmpresa.qr_code_pix || '',
        chave_pix: dadosEmpresa.chave_pix || '',
        nome_beneficiario_pix: dadosEmpresa.nome_beneficiario_pix || '',
        cidade_beneficiario_pix: dadosEmpresa.cidade_beneficiario_pix || ''
      });
    }
  }, [dadosEmpresa]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await empresaService.atualizarEmpresa(formData);
      if (response.success) {
        await atualizarDadosEmpresa();
        toast.success('Dados da empresa atualizados com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="configuracao-empresa">
      <h1>Configuração da Empresa</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Dados Básicos</h2>
          <div className="form-group">
            <label htmlFor="nome">Nome da Empresa</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cnpj">CNPJ</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Configurações de Pagamento PIX</h2>
          <div className="form-group">
            <label htmlFor="qr_code_pix">QR Code PIX (código)</label>
            <textarea
              id="qr_code_pix"
              name="qr_code_pix"
              value={formData.qr_code_pix}
              onChange={handleChange}
              placeholder="Cole aqui o código do QR Code PIX estático"
              rows={4}
            />
            <small>Este é o código do QR Code PIX estático que será exibido nos tickets</small>
          </div>

          <div className="form-group">
            <label htmlFor="chave_pix">Chave PIX</label>
            <input
              type="text"
              id="chave_pix"
              name="chave_pix"
              value={formData.chave_pix}
              onChange={handleChange}
              placeholder="Ex: seu@email.com, 12345678900, telefone"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nome_beneficiario_pix">Nome do Beneficiário PIX</label>
            <input
              type="text"
              id="nome_beneficiario_pix"
              name="nome_beneficiario_pix"
              value={formData.nome_beneficiario_pix}
              onChange={handleChange}
              placeholder="Nome que aparece como beneficiário do PIX"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cidade_beneficiario_pix">Cidade do Beneficiário PIX</label>
            <input
              type="text"
              id="cidade_beneficiario_pix"
              name="cidade_beneficiario_pix"
              value={formData.cidade_beneficiario_pix}
              onChange={handleChange}
              placeholder="Cidade do beneficiário do PIX"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-salvar"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracaoEmpresa; 