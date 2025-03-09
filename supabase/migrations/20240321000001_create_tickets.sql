-- Drop existing table if it exists
DROP TABLE IF EXISTS tickets;

-- Create tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa VARCHAR(8) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('PEQUENO', 'GRANDE', 'ESPECIAL', 'CARRINHO')),
  vaga_id UUID REFERENCES vagas(id) ON DELETE RESTRICT,
  hora_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  hora_saida TIMESTAMP WITH TIME ZONE,
  valor_total DECIMAL(10,2),
  status VARCHAR(10) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'FECHADO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON tickets;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON tickets;

CREATE POLICY "Permitir leitura para usuários autenticados"
ON tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir todas as operações para usuários autenticados"
ON tickets FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 