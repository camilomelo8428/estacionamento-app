// Tipos base
export interface BaseResponse {
  success: boolean;
  message: string;
}

// Tipos para Categorias de Veículos
export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  valorHora: number;
  valorMensalidade: number;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string;
  valorHora: number;
  valorMensalidade: number;
}

// Tipos para Mensalistas
export interface Mensalista {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  categoriaId: string;
  categoria: Categoria;
  veiculos: Veiculo[];
  ativo: boolean;
  dataInicio: string;
}

export interface MensalistaRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  categoriaId: string;
  veiculos: VeiculoRequest[];
}

// Tipos para Veículos
export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  mensalistaId?: string;
}

export interface VeiculoRequest {
  placa: string;
  modelo: string;
  cor: string;
}

// Tipos para Mensalidades
export interface Mensalidade {
  id: string;
  mensalistaId: string;
  mensalista: Mensalista;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
}

export interface MensalidadeRequest {
  mensalistaId: string;
  valor: number;
  dataVencimento: string;
}

// Tipos para Empresa
export interface DadosEmpresa {
  id: string;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  horarioAbertura: string;
  horarioFechamento: string;
  totalVagas: number;
}

export interface DadosEmpresaRequest {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  horarioAbertura: string;
  horarioFechamento: string;
  totalVagas: number;
}

// Tipos para Tickets
export interface Ticket {
  id: string;
  placa: string;
  categoriaId: string;
  categoria: Categoria;
  horaEntrada: string;
  horaSaida?: string;
  valor?: number;
  status: 'ABERTO' | 'FECHADO';
}

export interface TicketRequest {
  placa: string;
  categoriaId: string;
}

// Tipos para Relatórios
export interface RelatorioFaturamento {
  periodo: {
    inicio: string;
    fim: string;
  };
  totalFaturado: number;
  ticketsFinalizados: number;
  mensalidadesPagas: number;
  detalhamento: {
    tickets: {
      total: number;
      quantidade: number;
    };
    mensalidades: {
      total: number;
      quantidade: number;
    };
  };
} 