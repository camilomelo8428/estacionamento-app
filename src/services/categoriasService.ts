import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Categoria = Database['public']['Tables']['categorias']['Row'];
type CategoriaInsert = Database['public']['Tables']['categorias']['Insert'];
type CategoriaUpdate = Database['public']['Tables']['categorias']['Update'];

// Definição da estrutura de uma vaga baseada no banco de dados
interface Vaga {
  id: string;
  numero: string;
  status: 'LIVRE' | 'OCUPADA';
  categoria_id: string;
  placa: string | null;
  hora_entrada: string | null;
  hora_saida: string | null;
  valor_cobrado: number | null;
  created_at: string;
  updated_at: string;
}

interface BaseResponse {
  success: boolean;
  message: string;
}

interface ListaCategoriasResponse extends BaseResponse {
  data: Categoria[];
}

interface CategoriaUnicaResponse extends BaseResponse {
  data?: Categoria;
}

interface VagasCategoriaResponse extends BaseResponse {
  data: {
    categoria: Categoria | null;
    vagas: Vaga[];
  };
}

export const categoriasService = {
  // Listar todas as categorias
  listarCategorias: async (): Promise<ListaCategoriasResponse> => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) throw error;

      return {
        success: true,
        message: 'Categorias listadas com sucesso',
        data: data || []
      };
    } catch (error: any) {
      console.error('Erro ao listar categorias:', error);
      return {
        success: false,
        message: error.message || 'Erro ao listar categorias',
        data: []
      };
    }
  },

  // Criar nova categoria
  criarCategoria: async (categoria: CategoriaInsert): Promise<CategoriaUnicaResponse> => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Categoria criada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar categoria'
      };
    }
  },

  // Atualizar categoria
  atualizarCategoria: async (id: string, categoria: CategoriaUpdate): Promise<CategoriaUnicaResponse> => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(categoria)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Categoria atualizada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar categoria'
      };
    }
  },

  // Excluir categoria
  excluirCategoria: async (id: string): Promise<BaseResponse> => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Categoria excluída com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      return {
        success: false,
        message: error.message || 'Erro ao excluir categoria'
      };
    }
  },

  // Buscar categoria específica
  buscarCategoria: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        success: true,
        message: 'Categoria encontrada com sucesso',
        data
      };
    } catch (error: any) {
      console.error('Erro ao buscar categoria:', error);
      return {
        success: false,
        message: error.message || 'Erro ao buscar categoria'
      };
    }
  },

  // Buscar vagas por categoria
  buscarVagasPorCategoria: async (categoriaId: string) => {
    try {
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', categoriaId)
        .single();

      if (categoriaError) throw categoriaError;

      const { data: vagas, error: vagasError } = await supabase
        .from('vagas')
        .select('*')
        .eq('categoria_id', categoriaId)
        .order('numero');

      if (vagasError) throw vagasError;

      return {
        success: true,
        message: 'Vagas encontradas com sucesso',
        data: {
          categoria,
          vagas: vagas || []
        }
      };
    } catch (error: any) {
      console.error('Erro ao buscar vagas por categoria:', error);
      return {
        success: false,
        message: error.message || 'Erro ao buscar vagas por categoria',
        data: {
          categoria: null,
          vagas: []
        }
      };
    }
  },

  // Buscar vagas de veículos grandes com retry
  buscarVagasVeiculosGrandes: async (maxRetries = 3): Promise<VagasCategoriaResponse> => {
    let tentativas = 0;
    
    const executarBusca = async (): Promise<VagasCategoriaResponse> => {
      try {
        const { data: categoria, error: categoriaError } = await supabase
          .from('categorias')
          .select('*')
          .ilike('nome', '%grandes%')
          .single();

        if (categoriaError) throw categoriaError;

        const { data: vagas, error: vagasError } = await supabase
          .from('vagas')
          .select('*')
          .eq('categoria_id', categoria.id)
          .order('numero');

        if (vagasError) throw vagasError;

        return {
          success: true,
          message: 'Vagas de veículos grandes encontradas com sucesso',
          data: {
            categoria,
            vagas: vagas || []
          }
        };
      } catch (error: any) {
        if (tentativas < maxRetries) {
          tentativas++;
          // Espera exponencial entre tentativas (1s, 2s, 4s)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, tentativas - 1) * 1000));
          return executarBusca();
        }
        
        console.error('Erro ao buscar vagas de veículos grandes:', error);
        return {
          success: false,
          message: error.message || 'Erro ao buscar vagas de veículos grandes',
          data: {
            categoria: null,
            vagas: []
          }
        };
      }
    };

    return executarBusca();
  },

  // Atualizar limite de vagas de uma categoria
  atualizarLimiteVagas: async (categoriaId: string, novoLimite: number): Promise<CategoriaUnicaResponse> => {
    try {
      // Verificar se o novo limite é válido
      if (novoLimite < 1) {
        throw new Error('O limite mínimo é 1 vaga');
      }

      // Verificar se a categoria existe e obter informações atuais
      const { data: categoria, error: categoriaError } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', categoriaId)
        .single();

      if (categoriaError) throw categoriaError;
      if (!categoria) throw new Error('Categoria não encontrada');

      // Contar vagas ocupadas
      const { count: vagasOcupadasCount, error: countError } = await supabase
        .from('vagas')
        .select('*', { count: 'exact', head: true })
        .eq('categoria_id', categoriaId)
        .eq('status', 'OCUPADA');

      if (countError) throw countError;
      
      const vagasOcupadas = vagasOcupadasCount || 0;

      // Verificar se o novo limite é menor que o número de vagas ocupadas
      if (novoLimite < vagasOcupadas) {
        throw new Error(`Não é possível reduzir o limite para ${novoLimite} vagas pois existem ${vagasOcupadas} vagas ocupadas`);
      }

      // Atualizar o limite de vagas
      const { data, error } = await supabase
        .from('categorias')
        .update({ vagas: novoLimite })
        .eq('id', categoriaId)
        .select()
        .single();

      if (error) throw error;

      // Recriar vagas se necessário
      await supabase.rpc('recriar_vagas_categoria', {
        p_categoria_id: categoriaId
      });

      return {
        success: true,
        message: 'Limite de vagas atualizado com sucesso',
        data: data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar limite de vagas:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar limite de vagas'
      };
    }
  }
};

export default categoriasService; 