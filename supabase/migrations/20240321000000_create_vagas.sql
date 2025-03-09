-- Create vagas table
CREATE TABLE IF NOT EXISTS vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(10) NOT NULL UNIQUE,
  status VARCHAR(10) NOT NULL DEFAULT 'LIVRE' CHECK (status IN ('LIVRE', 'OCUPADA')),
  placa VARCHAR(8),
  hora_entrada TIMESTAMP WITH TIME ZONE,
  hora_saida TIMESTAMP WITH TIME ZONE,
  valor_cobrado DECIMAL(10,2),
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

CREATE TRIGGER update_vagas_updated_at
    BEFORE UPDATE ON vagas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial vagas
DO $$
DECLARE
  i INTEGER;
  categoria CHAR;
  vaga_numero VARCHAR;
BEGIN
  -- Inserir vagas para veículos pequenos (P1-P30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'P' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE')
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;

  -- Inserir vagas para veículos grandes (G1-G30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'G' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE')
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;

  -- Inserir vagas para veículos especiais (E1-E30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'E' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE')
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;

  -- Inserir vagas para carrinhos (C1-C30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'C' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE')
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON vagas;
DROP POLICY IF EXISTS "Permitir todas as operações para admin" ON vagas;
DROP POLICY IF EXISTS "Permitir todas as operações para usuários autenticados" ON vagas;

-- Create new policy for all authenticated users
CREATE POLICY "Permitir todas as operações para usuários autenticados"
ON vagas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 