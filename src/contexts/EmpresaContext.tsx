import React, { createContext, useContext, useState, useEffect } from 'react';
import { empresaService } from '../services/empresaService';
import { EmpresaData } from '../types/empresa';

interface EmpresaContextData {
  dadosEmpresa: EmpresaData | null;
  loading: boolean;
  error: string | null;
  recarregarDados: () => Promise<void>;
  atualizarDadosEmpresa: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextData>({} as EmpresaContextData);

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de um EmpresaProvider');
  }
  return context;
};

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dadosEmpresa, setDadosEmpresa] = useState<EmpresaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const dados = await empresaService.buscarInformacoes();
      if (dados) {
        setDadosEmpresa(dados);
      } else {
        throw new Error('Erro ao carregar dados da empresa');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const recarregarDados = async () => {
    await carregarDados();
  };

  const atualizarDadosEmpresa = async () => {
    await carregarDados();
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <EmpresaContext.Provider
      value={{
        dadosEmpresa,
        loading,
        error,
        recarregarDados,
        atualizarDadosEmpresa
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}; 