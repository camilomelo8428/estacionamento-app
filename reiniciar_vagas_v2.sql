-- Desabilitar RLS temporariamente
ALTER TABLE vagas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Limpar tickets existentes primeiro
DELETE FROM tickets;

-- Limpar vagas existentes
DELETE FROM vagas;

-- Função para criar vagas por categoria
DO $$
DECLARE
    v_categoria RECORD;
    v_prefixo VARCHAR(1);
    v_numero VARCHAR(10);
    i INTEGER;
BEGIN
    -- Iterar sobre cada categoria
    FOR v_categoria IN (SELECT id, nome, vagas FROM categorias ORDER BY nome) LOOP
        -- Determinar o prefixo baseado no nome da categoria
        v_prefixo := CASE 
            WHEN v_categoria.nome ILIKE '%pequenos%' THEN 'P'
            WHEN v_categoria.nome ILIKE '%grandes%' THEN 'G'
            WHEN v_categoria.nome ILIKE '%especiais%' THEN 'E'
            WHEN v_categoria.nome ILIKE '%motos%' THEN 'M'
            ELSE 'X'
        END;
        
        -- Criar vagas para a categoria atual
        FOR i IN 1..v_categoria.vagas LOOP
            v_numero := v_prefixo || i;
            
            INSERT INTO vagas (
                numero,
                status,
                categoria_id,
                placa,
                tipo,
                hora_entrada,
                hora_saida,
                valor_cobrado
            ) VALUES (
                v_numero,
                'LIVRE',
                v_categoria.id,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL
            );
        END LOOP;
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY; 