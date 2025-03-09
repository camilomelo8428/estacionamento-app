-- Create mensalidades table
CREATE TABLE IF NOT EXISTS mensalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensalista_id UUID REFERENCES mensalistas(id) ON DELETE RESTRICT,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(10) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_mensalidades_updated_at ON mensalidades;

-- Create trigger to update updated_at
CREATE TRIGGER update_mensalidades_updated_at
    BEFORE UPDATE ON mensalidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS
ALTER TABLE mensalidades DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON mensalidades;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON mensalidades; 