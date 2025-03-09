-- Drop existing function if exists
DROP FUNCTION IF EXISTS recriar_vagas_categoria(UUID);

-- Create function to recreate parking spots for a specific category
CREATE OR REPLACE FUNCTION recriar_vagas_categoria(p_categoria_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_categoria RECORD;
    v_prefixo VARCHAR(1);
    v_numero VARCHAR(10);
    v_categoria_tipo VARCHAR(20);
    i INTEGER;
BEGIN
    -- Get category information
    SELECT * INTO v_categoria
    FROM categorias
    WHERE id = p_categoria_id;

    IF v_categoria IS NULL THEN
        RAISE EXCEPTION 'Categoria não encontrada';
    END IF;

    -- Determine prefix based on category name
    v_prefixo := CASE 
        WHEN v_categoria.nome ILIKE '%pequenos%' THEN 'P'
        WHEN v_categoria.nome ILIKE '%grandes%' THEN 'G'
        WHEN v_categoria.nome ILIKE '%especiais%' THEN 'E'
        WHEN v_categoria.nome ILIKE '%motos%' THEN 'M'
        ELSE 'X'
    END;

    -- Determine category type
    v_categoria_tipo := CASE 
        WHEN v_categoria.nome ILIKE '%pequenos%' THEN 'PEQUENO'
        WHEN v_categoria.nome ILIKE '%grandes%' THEN 'GRANDE'
        WHEN v_categoria.nome ILIKE '%especiais%' THEN 'ESPECIAL'
        WHEN v_categoria.nome ILIKE '%motos%' THEN 'MOTO'
        ELSE 'PEQUENO'
    END;

    -- Delete existing free spots for this category
    DELETE FROM vagas
    WHERE categoria_id = p_categoria_id
    AND status = 'LIVRE';

    -- Create new spots up to the category limit
    FOR i IN 1..v_categoria.vagas LOOP
        v_numero := v_prefixo || i;
        
        -- Only create if spot number doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM vagas 
            WHERE categoria_id = p_categoria_id 
            AND numero = v_numero
        ) THEN
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
                p_categoria_id,
                v_categoria_tipo,
                NULL,
                NULL,
                NULL,
                NULL,
                NULL
            );
        END IF;
    END LOOP;
END;
$$; 