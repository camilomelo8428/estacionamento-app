import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { Container } from './styles';
import { empresaService } from '../../services/empresaService';
import { useEmpresa } from '../../contexts/EmpresaContext';
import { Database } from '../../types/supabase';
import { ConfigProvider, theme } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

type EmpresaInsert = Database['public']['Tables']['empresa']['Insert'];

const DadosEmpresa: React.FC = () => {
  const [form] = Form.useForm();
  const { atualizarDadosEmpresa } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await empresaService.buscarInformacoes();
      if (dados) {
        form.setFieldsValue(dados);
      }
    } catch (error) {
      message.error('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSubmit = async (values: EmpresaInsert) => {
    try {
      setSaving(true);
      await empresaService.salvarInformacoes(values);
      await atualizarDadosEmpresa();
      message.success('Dados salvos com sucesso!');
    } catch (error) {
      message.error('Erro ao salvar dados da empresa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          borderRadius: 8,
          colorBgContainer: 'var(--card-background)',
          colorText: 'var(--text-primary)',
          colorBorder: 'var(--border-color)',
        },
      }}
    >
      <Container>
        <h2>Dados da Empresa</h2>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="animate-fade-in"
          >
            <div className="form-grid">
              <Form.Item
                label="Nome da Empresa"
                name="nome"
                rules={[{ required: true, message: 'Por favor, insira o nome da empresa' }]}
              >
                <Input placeholder="Digite o nome da empresa" />
              </Form.Item>

              <Form.Item
                label="CNPJ"
                name="cnpj"
                rules={[{ required: true, message: 'Por favor, insira o CNPJ' }]}
              >
                <Input placeholder="00.000.000/0000-00" />
              </Form.Item>
            </div>

            <div className="form-grid">
              <Form.Item
                label="E-mail"
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira o e-mail' },
                  { type: 'email', message: 'Por favor, insira um e-mail válido' }
                ]}
              >
                <Input placeholder="email@empresa.com" />
              </Form.Item>

              <Form.Item
                label="Telefone"
                name="telefone"
              >
                <Input placeholder="(00) 0000-0000" />
              </Form.Item>
            </div>

            <Form.Item
              label="Endereço"
              name="endereco"
            >
              <Input placeholder="Digite o endereço completo" />
            </Form.Item>

            <Form.Item
              label="Mensagem Personalizada"
              name="mensagem"
            >
              <Input.TextArea 
                placeholder="Esta mensagem será exibida nos comprovantes"
                rows={4}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Container>
    </ConfigProvider>
  );
};

export default DadosEmpresa; 