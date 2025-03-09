export interface Vaga {
  id?: string;
  numero: string;
  status: 'LIVRE' | 'OCUPADA';
  placa?: string;
  tipo?: 'AVULSO' | 'MENSALISTA';
  hora_entrada?: string;
  hora_saida?: string;
  valor_cobrado?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VagaRequest {
  numero: string;
  placa?: string;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface ListaVagasResponse extends BaseResponse {
  data: Vaga[];
}

export interface VagaUnicaResponse extends BaseResponse {
  data?: Vaga;
}

export type VagaResponse = ListaVagasResponse | VagaUnicaResponse; 