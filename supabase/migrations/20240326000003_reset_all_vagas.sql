-- Primeiro, limpar todos os tickets
DELETE FROM tickets;

-- Depois, limpar todas as vagas existentes
DELETE FROM vagas;

-- Função para recriar todas as vagas
DO $$
DECLARE
    v_categoria RECORD;
    v_prefixo VARCHAR(1);
    v_numero VARCHAR(10);
    v_categoria_tipo VARCHAR(20);
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

        -- Determinar o tipo de categoria
        v_categoria_tipo := CASE 
            WHEN v_categoria.nome ILIKE '%pequenos%' THEN 'PEQUENO'
            WHEN v_categoria.nome ILIKE '%grandes%' THEN 'GRANDE'
            WHEN v_categoria.nome ILIKE '%especiais%' THEN 'ESPECIAL'
            WHEN v_categoria.nome ILIKE '%motos%' THEN 'MOTO'
            ELSE 'PEQUENO'
        END;
        
        -- Criar vagas para a categoria atual
        FOR i IN 1..v_categoria.vagas LOOP
            v_numero := v_prefixo || i;
            
            INSERT INTO vagas (
                numero,
                status,
                categoria_id,
                categoria,
                placa,
                tipo,
                hora_entrada,
                hora_saida,
                valor_cobrado
            ) VALUES (
                v_numero,
                'LIVRE',
                v_categoria.id,
                v_categoria_tipo,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL
            );
        END LOOP;
    END LOOP;
END $$; 