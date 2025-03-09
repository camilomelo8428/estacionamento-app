-- Create categorias table
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  preco_hora DECIMAL(10,2) NOT NULL,
  preco_dia DECIMAL(10,2) NOT NULL,
  preco_mes DECIMAL(10,2) NOT NULL,
  vagas INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;

-- Create trigger to update updated_at
CREATE TRIGGER update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO categorias (nome, preco_hora, preco_dia, preco_mes, vagas)
VALUES 
  ('Veículos pequenos', 8.00, 15.00, 150.00, 30),
  ('Veículos Grandes', 15.00, 30.00, 200.00, 30),
  ('Veículos especiais', 20.00, 50.00, 250.00, 30),
  ('Carrinhos', 2.00, 7.00, 30.00, 100)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY; 