import { Database } from './supabase';

type VeiculoMensalista = Database['public']['Tables']['veiculos_mensalistas']['Row'];

export interface Mensalista {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  veiculos: VeiculoMensalista[];
} 