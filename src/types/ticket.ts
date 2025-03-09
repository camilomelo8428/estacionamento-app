export interface Ticket {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  categoria: 'PEQUENO' | 'GRANDE' | 'ESPECIAL' | 'CARRINHO';
  vaga_id: string;
  hora_entrada: string;
  hora_saida?: string;
  valor_total?: number;
  status: 'ABERTO' | 'FECHADO';
  tipo: 'AVULSO' | 'MENSALISTA';
  mensalista_id?: string;
  veiculo_id?: string;
  mensalista?: {
    id: string;
    nome: string;
  };
  veiculo?: {
    id: string;
    placa: string;
    modelo: string;
    cor: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TicketRequest {
  placa: string;
  modelo: string;
  cor: string;
  categoria: 'PEQUENO' | 'GRANDE' | 'ESPECIAL' | 'MOTO';
  vaga_id: string;
  tipo?: 'AVULSO' | 'MENSALISTA';
  mensalista_id?: string;
  veiculo_id?: string;
}

export interface ListaTicketsResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

export interface TicketUnicoResponse {
  success: boolean;
  message: string;
  data?: Ticket;
} 