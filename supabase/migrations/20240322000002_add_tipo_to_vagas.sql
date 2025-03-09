-- Adicionar campo tipo na tabela vagas
ALTER TABLE vagas
ADD COLUMN tipo VARCHAR CHECK (tipo IN ('AVULSO', 'MENSALISTA')) DEFAULT NULL;

-- Atualizar o tipo das vagas existentes baseado nos tickets
UPDATE vagas v
SET tipo = t.tipo
FROM tickets t
WHERE v.id = t.vaga_id AND v.status = 'OCUPADA'; 