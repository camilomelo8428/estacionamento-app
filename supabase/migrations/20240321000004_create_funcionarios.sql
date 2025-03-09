-- Create funcionarios table
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ADMINISTRADOR', 'OPERADOR')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_funcionarios_updated_at ON funcionarios;

-- Create trigger to update updated_at
CREATE TRIGGER update_funcionarios_updated_at
    BEFORE UPDATE ON funcionarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS
ALTER TABLE funcionarios DISABLE ROW LEVEL SECURITY;

-- Insert initial admin user (you should update the auth_user_id later)
INSERT INTO funcionarios (nome, email, tipo, ativo)
VALUES ('Administrador', 'camilomelo8428@gmail.com', 'ADMINISTRADOR', true)
ON CONFLICT (email) DO NOTHING; 