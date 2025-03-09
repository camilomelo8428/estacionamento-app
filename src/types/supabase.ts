export type Database = {
  public: {
    Tables: {
      mensalistas: {
        Row: {
          id: string
          nome: string
          cpf: string
          email: string
          telefone: string
          ativo: boolean
          created_at: string
          updated_at: string
          dia_vencimento: number
          veiculos: VeiculoMensalista[]
        }
        Insert: {
          nome: string
          cpf: string | null
          email: string | null
          telefone: string | null
          ativo?: boolean
          dia_vencimento: number
        }
        Update: {
          nome?: string
          cpf?: string | null
          email?: string | null
          telefone?: string | null
          ativo?: boolean
          dia_vencimento?: number
        }
      }
      veiculos_mensalistas: {
        Row: {
          id: string
          mensalista_id: string
          placa: string
          modelo: string
          cor: string
          created_at: string
          updated_at: string
        }
        Insert: {
          mensalista_id: string
          placa: string
          modelo: string
          cor: string
          updated_at?: string
        }
        Update: {
          placa?: string
          modelo?: string
          cor?: string
          updated_at?: string
        }
      }
      mensalidades: {
        Row: {
          id: string
          mensalista_id: string
          valor: number
          data_vencimento: string
          data_pagamento: string | null
          status: string
          valor_multa: number | null
          valor_juros: number | null
          dias_atraso: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          mensalista_id: string
          valor: number
          data_vencimento: string
          status?: string
        }
        Update: {
          valor?: number
          data_vencimento?: string
          data_pagamento?: string | null
          status?: string
          valor_multa?: number | null
          valor_juros?: number | null
          dias_atraso?: number | null
        }
      }
      configuracoes_multa: {
        Row: {
          id: string
          percentual_multa: number
          percentual_juros_dia: number
          created_at: string
          updated_at: string
        }
        Insert: {
          percentual_multa: number
          percentual_juros_dia: number
        }
        Update: {
          id?: string
          percentual_multa?: number
          percentual_juros_dia?: number
        }
      }
      empresa: {
        Row: {
          id: string
          nome: string
          cnpj: string
          endereco: string
          telefone: string
          email: string
          mensagem: string
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          cnpj: string
          endereco: string | null
          telefone: string | null
          email: string
          mensagem?: string | null
        }
        Update: {
          nome?: string
          cnpj?: string
          endereco?: string | null
          telefone?: string | null
          email?: string
          mensagem?: string | null
        }
      }
      funcionarios: {
        Row: {
          id: string
          nome: string
          cpf: string
          email: string
          telefone: string
          cargo: string
          tipo: 'ADMINISTRADOR' | 'OPERADOR'
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          cpf: string
          email: string
          telefone: string
          cargo: string
          tipo: 'ADMINISTRADOR' | 'OPERADOR'
          ativo?: boolean
        }
        Update: {
          nome?: string
          cpf?: string
          email?: string
          telefone?: string
          cargo?: string
          tipo?: 'ADMINISTRADOR' | 'OPERADOR'
          ativo?: boolean
        }
      }
      categorias: {
        Row: {
          id: string
          nome: string
          preco_hora: number
          preco_dia: number
          preco_mes: number
          vagas: number
          created_at: string
          updated_at: string
        }
        Insert: {
          nome: string
          preco_hora: number
          preco_dia: number
          preco_mes: number
          vagas: number
        }
        Update: {
          nome?: string
          preco_hora?: number
          preco_dia?: number
          preco_mes?: number
          vagas?: number
        }
      }
      tickets: {
        Row: {
          id: string
          placa: string
          modelo: string
          tipo: 'AVULSO' | 'MENSALISTA'
          status: 'ABERTO' | 'FECHADO'
          hora_entrada: string
          hora_saida: string | null
          mensalista_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          placa: string
          modelo: string
          tipo: 'AVULSO' | 'MENSALISTA'
          status?: 'ABERTO' | 'FECHADO'
          hora_entrada: string
          mensalista_id?: string
        }
        Update: {
          status?: 'ABERTO' | 'FECHADO'
          hora_saida?: string | null
        }
      }
    }
  }
}

export type VeiculoMensalista = Database['public']['Tables']['veiculos_mensalistas']['Row']
export type Mensalista = Database['public']['Tables']['mensalistas']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Funcionario = Database['public']['Tables']['funcionarios']['Row']
export type Empresa = Database['public']['Tables']['empresa']['Row']

export type VeiculoMensalistaInsert = Database['public']['Tables']['veiculos_mensalistas']['Insert']
export type VeiculoMensalistaUpdate = Database['public']['Tables']['veiculos_mensalistas']['Update']

export type MensalistaInsert = Database['public']['Tables']['mensalistas']['Insert']
export type MensalistaUpdate = Database['public']['Tables']['mensalistas']['Update']

export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']

export type FuncionarioInsert = Database['public']['Tables']['funcionarios']['Insert']
export type FuncionarioUpdate = Database['public']['Tables']['funcionarios']['Update']

export type EmpresaInsert = Database['public']['Tables']['empresa']['Insert']
export type EmpresaUpdate = Database['public']['Tables']['empresa']['Update']

export type TicketInsert = Database['public']['Tables']['tickets']['Insert']
export type TicketUpdate = Database['public']['Tables']['tickets']['Update']
