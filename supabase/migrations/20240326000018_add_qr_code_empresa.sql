-- Adicionar campo de QR code na tabela empresa
ALTER TABLE empresa 
ADD COLUMN IF NOT EXISTS qr_code_pix TEXT;

-- Adicionar campo de chave pix
ALTER TABLE empresa
ADD COLUMN IF NOT EXISTS chave_pix TEXT;

-- Adicionar campo de nome beneficiário
ALTER TABLE empresa
ADD COLUMN IF NOT EXISTS nome_beneficiario_pix TEXT;

-- Adicionar campo de cidade beneficiário
ALTER TABLE empresa
ADD COLUMN IF NOT EXISTS cidade_beneficiario_pix TEXT;

COMMENT ON COLUMN empresa.qr_code_pix IS 'QR Code estático do PIX para pagamentos';
COMMENT ON COLUMN empresa.chave_pix IS 'Chave PIX para pagamentos';
COMMENT ON COLUMN empresa.nome_beneficiario_pix IS 'Nome do beneficiário do PIX';
COMMENT ON COLUMN empresa.cidade_beneficiario_pix IS 'Cidade do beneficiário do PIX'; 