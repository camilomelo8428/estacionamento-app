import { Database } from './supabase';

export type Empresa = Database['public']['Tables']['empresa']['Row'];
export type EmpresaInsert = Database['public']['Tables']['empresa']['Insert'];
export type EmpresaUpdate = Database['public']['Tables']['empresa']['Update'];

export interface EmpresaData {
  nome: string;
  cnpj: string;
  telefone: string | null;
  endereco: string | null;
  email: string;
  mensagem: string | null;
} 