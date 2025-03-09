-- Adicionar coluna valor_total na tabela mensalidades
ALTER TABLE mensalidades
ADD COLUMN valor_total DECIMAL(10,2);

-- Atualizar os registros existentes para ter valor_total igual ao valor base
UPDATE mensalidades
SET valor_total = valor
WHERE valor_total IS NULL; 