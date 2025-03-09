-- Create layout_vagas table
CREATE TABLE IF NOT EXISTS layout_vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE RESTRICT,
  setor VARCHAR(50) NOT NULL,
  inicio_numeracao INTEGER NOT NULL,
  fim_numeracao INTEGER NOT NULL,
  prefixo VARCHAR(1) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE TRIGGER update_layout_vagas_updated_at
    BEFORE UPDATE ON layout_vagas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create unique constraint to prevent overlapping ranges
ALTER TABLE layout_vagas
ADD CONSTRAINT layout_vagas_unique_range
UNIQUE (setor, prefixo, inicio_numeracao, fim_numeracao);

-- Enable RLS
ALTER TABLE layout_vagas ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Permitir todas as operações para usuários autenticados"
ON layout_vagas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert initial layout
INSERT INTO layout_vagas (categoria_id, setor, inicio_numeracao, fim_numeracao, prefixo, ordem)
SELECT 
  id as categoria_id,
  CASE 
    WHEN nome LIKE '%pequenos%' THEN 'TÉRREO'
    WHEN nome LIKE '%Grandes%' THEN 'TÉRREO'
    WHEN nome LIKE '%especiais%' THEN 'TÉRREO'
    ELSE 'SUBSOLO'
  END as setor,
  1 as inicio_numeracao,
  vagas as fim_numeracao,
  CASE 
    WHEN nome LIKE '%pequenos%' THEN 'P'
    WHEN nome LIKE '%Grandes%' THEN 'G'
    WHEN nome LIKE '%especiais%' THEN 'E'
    ELSE 'C'
  END as prefixo,
  CASE 
    WHEN nome LIKE '%pequenos%' THEN 1
    WHEN nome LIKE '%Grandes%' THEN 2
    WHEN nome LIKE '%especiais%' THEN 3
    ELSE 4
  END as ordem
FROM categorias; 