-- Adicionar colunas faltantes na tabela empresa
ALTER TABLE empresa
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18) NOT NULL DEFAULT '00.000.000/0000-00',
ADD COLUMN IF NOT EXISTS email VARCHAR(100) NOT NULL DEFAULT 'email@empresa.com';

-- Atualizar a estrutura da tabela para garantir que todos os campos necessários existam
ALTER TABLE empresa
ALTER COLUMN nome SET NOT NULL,
ALTER COLUMN cnpj SET NOT NULL,
ALTER COLUMN email SET NOT NULL; 