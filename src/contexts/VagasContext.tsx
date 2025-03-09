import React, { createContext, useContext, useState, useCallback } from 'react';
import { Vaga, VagaRequest } from '../types/vaga';
import { vagasService } from '../services/vagasService';

interface VagasContextData {
  vagas: Vaga[];
  loading: boolean;
  error: string | null;
  listarVagas: () => Promise<void>;
  criarVaga: (vaga: VagaRequest) => Promise<void>;
  ocuparVaga: (id: string, placa: string, tipo?: 'AVULSO' | 'MENSALISTA') => Promise<void>;
  liberarVaga: (id: string) => Promise<void>;
  deletarVaga: (id: string) => Promise<void>;
}

const VagasContext = createContext<VagasContextData>({} as VagasContextData);

export const VagasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listarVagas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vagasService.listarVagas();
      if (response.success) {
        setVagas(response.data);
      }
    } catch (err) {
      setError('Erro ao listar vagas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarVaga = useCallback(async (vaga: VagaRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vagasService.criarVaga(vaga);
      if (response.success && response.data) {
        const novaVaga = response.data;
        setVagas(prev => [...prev, novaVaga]);
      }
    } catch (err) {
      setError('Erro ao criar vaga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const ocuparVaga = useCallback(async (id: string, placa: string, tipo: 'AVULSO' | 'MENSALISTA' = 'AVULSO') => {
    try {
      setLoading(true);
      setError(null);
      const response = await vagasService.ocuparVaga(id, placa, tipo);
      if (response.success && response.data) {
        const vagaAtualizada = response.data;
        setVagas(prev => prev.map(vaga => 
          vaga.id === id ? vagaAtualizada : vaga
        ));
      }
    } catch (err: any) {
      console.error('Erro detalhado:', err);
      let mensagemErro = 'Erro ao ocupar vaga. Por favor, tente novamente.';
      
      if (err.message?.includes('Número máximo de vagas excedido')) {
        mensagemErro = 'Esta categoria já atingiu o limite máximo de vagas ocupadas. Por favor, aguarde uma vaga ser liberada ou escolha outra categoria.';
      } else if (err.message?.includes('não está livre')) {
        mensagemErro = 'Esta vaga não está mais disponível. Por favor, escolha outra vaga.';
      } else if (err.message?.includes('não encontrada')) {
        mensagemErro = 'Vaga não encontrada. Por favor, atualize a página e tente novamente.';
      }
      
      setError(mensagemErro);
      await listarVagas(); // Atualizar lista de vagas para garantir sincronização
    } finally {
      setLoading(false);
    }
  }, [listarVagas]);

  const liberarVaga = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vagasService.liberarVaga(id);
      if (response.success && response.data) {
        const vagaAtualizada = response.data;
        setVagas(prev => prev.map(vaga => 
          vaga.id === id ? vagaAtualizada : vaga
        ));
      }
    } catch (err) {
      setError('Erro ao liberar vaga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletarVaga = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await vagasService.deletarVaga(id);
      if (response.success) {
        setVagas(prev => prev.filter(vaga => vaga.id !== id));
      }
    } catch (err) {
      setError('Erro ao deletar vaga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <VagasContext.Provider 
      value={{
        vagas,
        loading,
        error,
        listarVagas,
        criarVaga,
        ocuparVaga,
        liberarVaga,
        deletarVaga
      }}
    >
      {children}
    </VagasContext.Provider>
  );
};

export const useVagas = () => {
  const context = useContext(VagasContext);
  if (!context) {
    throw new Error('useVagas deve ser usado dentro de um VagasProvider');
  }
  return context;
}; 