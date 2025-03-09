-- Adiciona a coluna updated_at se ela não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'funcionarios' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE funcionarios 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Atualiza os registros existentes para ter um valor em updated_at
UPDATE funcionarios 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Cria ou atualiza a função do trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remove o trigger se existir
DROP TRIGGER IF EXISTS update_funcionarios_updated_at ON funcionarios;

-- Cria o trigger
CREATE TRIGGER update_funcionarios_updated_at
    BEFORE UPDATE ON funcionarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 