-- Desabilitar RLS
ALTER TABLE vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Limpar tickets existentes primeiro
DELETE FROM tickets;

-- Limpar vagas existentes
DELETE FROM vagas;

-- Inserir vagas iniciais
DO $$
DECLARE
  i INTEGER;
  vaga_numero VARCHAR;
BEGIN
  -- Inserir vagas para veículos pequenos (P1-P30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'P' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE');
  END LOOP;

  -- Inserir vagas para veículos grandes (G1-G30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'G' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE');
  END LOOP;

  -- Inserir vagas para veículos especiais (E1-E30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'E' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE');
  END LOOP;

  -- Inserir vagas para motos (M1-M30)
  FOR i IN 1..30 LOOP
    vaga_numero := 'M' || i;
    INSERT INTO vagas (numero, status) VALUES (vaga_numero, 'LIVRE');
  END LOOP;
END $$; 