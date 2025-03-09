-- Drop existing function if exists
DROP FUNCTION IF EXISTS limpar_tickets();

-- Create function to safely clear tickets and free up parking spots
CREATE OR REPLACE FUNCTION limpar_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Primeiro, liberar todas as vagas ocupadas
    UPDATE vagas
    SET 
        status = 'LIVRE',
        placa = NULL,
        tipo = NULL,
        hora_entrada = NULL,
        hora_saida = NULL,
        valor_cobrado = NULL,
        updated_at = NOW()
    WHERE status = 'OCUPADA';

    -- Depois, limpar todos os tickets
    DELETE FROM tickets;

    -- Recriar vagas para todas as categorias
    FOR v_categoria IN (SELECT id FROM categorias) LOOP
        PERFORM recriar_vagas_categoria(v_categoria.id);
    END LOOP;
END;
$$;

-- Create a trigger function to prevent direct deletion of tickets
CREATE OR REPLACE FUNCTION prevent_direct_ticket_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' AND current_setting('app.bypass_triggers', true) != 'true' THEN
        RAISE EXCEPTION 'Não é permitido deletar tickets diretamente. Use a função limpar_tickets() para isso.';
    END IF;
    RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_ticket_deletion ON tickets;
CREATE TRIGGER prevent_ticket_deletion
    BEFORE DELETE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION prevent_direct_ticket_deletion();

-- Create a function to safely delete a single ticket
CREATE OR REPLACE FUNCTION deletar_ticket(p_ticket_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vaga_id UUID;
BEGIN
    -- Get the vaga_id from the ticket
    SELECT vaga_id INTO v_vaga_id
    FROM tickets
    WHERE id = p_ticket_id;

    IF v_vaga_id IS NULL THEN
        RAISE EXCEPTION 'Ticket não encontrado';
    END IF;

    -- Liberar a vaga
    UPDATE vagas
    SET 
        status = 'LIVRE',
        placa = NULL,
        tipo = NULL,
        hora_entrada = NULL,
        hora_saida = NULL,
        valor_cobrado = NULL,
        updated_at = NOW()
    WHERE id = v_vaga_id;

    -- Set the flag to bypass the trigger
    SET LOCAL app.bypass_triggers = 'true';

    -- Delete the ticket
    DELETE FROM tickets
    WHERE id = p_ticket_id;

    -- Reset the flag
    SET LOCAL app.bypass_triggers = 'false';
END;
$$; 