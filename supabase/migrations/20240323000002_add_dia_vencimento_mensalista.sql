-- Adicionar campo dia_vencimento na tabela mensalistas
ALTER TABLE mensalistas
ADD COLUMN dia_vencimento INTEGER CHECK (dia_vencimento BETWEEN 1 AND 31);

-- Atualizar mensalistas existentes com dia 5 como padrão
UPDATE mensalistas
SET dia_vencimento = 5
WHERE dia_vencimento IS NULL; 