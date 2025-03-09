-- Atualizar nome da categoria de Carrinhos para Motos
UPDATE categorias
SET nome = 'Motos'
WHERE nome = 'Carrinhos';

-- Atualizar prefixo das vagas de C para M
UPDATE vagas
SET numero = REPLACE(numero, 'C', 'M')
WHERE numero LIKE 'C%';

-- Atualizar prefixo no layout de vagas
UPDATE layout_vagas
SET prefixo = 'M'
WHERE prefixo = 'C'; 