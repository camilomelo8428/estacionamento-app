-- Criar tabela de configurações de multa
CREATE TABLE IF NOT EXISTS configuracoes_multa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    percentual_multa DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    percentual_juros_dia DECIMAL(5,2) NOT NULL DEFAULT 0.033,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos para multa na tabela de mensalidades
ALTER TABLE mensalidades
ADD COLUMN IF NOT EXISTS valor_multa DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_juros DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dias_atraso INTEGER;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_multa_updated_at
    BEFORE UPDATE ON configuracoes_multa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir configuração padrão
INSERT INTO configuracoes_multa (percentual_multa, percentual_juros_dia)
VALUES (2.00, 0.033)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE configuracoes_multa ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Permitir todas as operações para usuários autenticados"
ON configuracoes_multa FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 