export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMINISTRADOR' | 'OPERADOR';
  type: 'ADMINISTRADOR' | 'OPERADOR';
  tipo: 'ADMINISTRADOR' | 'OPERADOR';
  ativo: boolean;
} 