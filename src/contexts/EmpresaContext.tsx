import React, { createContext, useContext, useState, useEffect } from 'react';
import { empresaService } from '../services/empresaService';
import { EmpresaData } from '../types/supabase';

interface EmpresaContextData {
  dadosEmpresa: EmpresaData | null;
  atualizarDadosEmpresa: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextData>({} as EmpresaContextData);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dadosEmpresa, setDadosEmpresa] = useState<EmpresaData | null>(null);

  const atualizarDadosEmpresa = async () => {
    try {
      const dados = await empresaService.buscarInformacoes();
      setDadosEmpresa(dados);
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
    }
  };

  useEffect(() => {
    atualizarDadosEmpresa();
  }, []);

  return (
    <EmpresaContext.Provider value={{ dadosEmpresa, atualizarDadosEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de um EmpresaProvider');
  }
  return context;
}; 