-- Remover o check constraint antigo
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_categoria_check;

-- Adicionar o novo check constraint
ALTER TABLE tickets ADD CONSTRAINT tickets_categoria_check 
CHECK (categoria IN ('PEQUENO', 'GRANDE', 'ESPECIAL', 'MOTO')); 