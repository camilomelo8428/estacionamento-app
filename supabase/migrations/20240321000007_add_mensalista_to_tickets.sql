-- Adicionar coluna tipo para diferenciar tickets avulsos e mensalistas
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'AVULSO' CHECK (tipo IN ('AVULSO', 'MENSALISTA'));

-- Adicionar colunas para relacionamento com mensalistas
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS mensalista_id UUID REFERENCES mensalistas(id),
ADD COLUMN IF NOT EXISTS veiculo_id UUID REFERENCES veiculos_mensalistas(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tickets_tipo ON tickets(tipo);
CREATE INDEX IF NOT EXISTS idx_tickets_mensalista_id ON tickets(mensalista_id);
CREATE INDEX IF NOT EXISTS idx_tickets_veiculo_id ON tickets(veiculo_id);

-- Atualizar tickets existentes para tipo AVULSO
UPDATE tickets SET tipo = 'AVULSO' WHERE tipo IS NULL;

-- Adicionar constraint para garantir que tickets mensalistas tenham mensalista_id
ALTER TABLE tickets
ADD CONSTRAINT check_mensalista_ticket 
CHECK (
  (tipo = 'MENSALISTA' AND mensalista_id IS NOT NULL) OR 
  (tipo = 'AVULSO' AND mensalista_id IS NULL)
); 