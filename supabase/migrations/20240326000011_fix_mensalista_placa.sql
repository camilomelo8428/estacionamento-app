-- Drop existing function
DROP FUNCTION IF EXISTS ocupar_vaga(UUID, VARCHAR, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS ocupar_vaga(UUID, VARCHAR, TIMESTAMP WITH TIME ZONE, VARCHAR);

-- Criar função para ocupar vaga de forma atômica
CREATE OR REPLACE FUNCTION ocupar_vaga(
  p_vaga_id UUID,
  p_placa VARCHAR,
  p_hora_entrada TIMESTAMP WITH TIME ZONE,
  p_tipo VARCHAR DEFAULT 'AVULSO'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vaga_info JSONB;
  v_mensalista_id UUID;
  v_tem_mensalidade_ativa BOOLEAN;
  v_tem_mensalidade_atrasada BOOLEAN;
BEGIN
  -- Obter informações da vaga e verificar se está livre
  SELECT 
    jsonb_build_object(
      'id', v.id,
      'categoria_id', v.categoria_id,
      'numero', v.numero,
      'status', v.status,
      'placa', v.placa,
      'tipo', v.tipo,
      'hora_entrada', v.hora_entrada,
      'hora_saida', v.hora_saida,
      'valor_cobrado', v.valor_cobrado,
      'created_at', v.created_at,
      'updated_at', v.updated_at
    ) INTO v_vaga_info
  FROM vagas v
  WHERE v.id = p_vaga_id
  FOR UPDATE;
  
  IF v_vaga_info IS NULL THEN
    RAISE EXCEPTION 'Vaga não encontrada' USING ERRCODE = 'P0001';
  END IF;

  IF (v_vaga_info->>'status')::TEXT != 'LIVRE' THEN
    RAISE EXCEPTION 'Vaga não está livre' USING ERRCODE = 'P0001';
  END IF;

  -- Se for ticket mensalista, verificar situação das mensalidades
  IF p_tipo = 'MENSALISTA' THEN
    -- Buscar ID do mensalista pela placa do veículo
    SELECT m.id INTO v_mensalista_id
    FROM mensalistas m
    JOIN veiculos v ON v.mensalista_id = m.id
    WHERE v.placa = p_placa;

    IF v_mensalista_id IS NULL THEN
      RAISE EXCEPTION 'Mensalista não encontrado com esta placa' USING ERRCODE = 'P0001';
    END IF;

    -- Verificar se tem mensalidade ativa
    SELECT EXISTS (
      SELECT 1 
      FROM mensalidades 
      WHERE mensalista_id = v_mensalista_id
      AND data_inicio <= CURRENT_DATE 
      AND data_fim >= CURRENT_DATE
      AND status = 'PAGO'
    ) INTO v_tem_mensalidade_ativa;

    IF NOT v_tem_mensalidade_ativa THEN
      RAISE EXCEPTION 'Mensalista não possui mensalidade ativa' USING ERRCODE = 'P0001';
    END IF;

    -- Verificar se tem mensalidades atrasadas
    SELECT EXISTS (
      SELECT 1 
      FROM mensalidades 
      WHERE mensalista_id = v_mensalista_id
      AND data_vencimento < CURRENT_DATE
      AND status = 'PENDENTE'
    ) INTO v_tem_mensalidade_atrasada;

    IF v_tem_mensalidade_atrasada THEN
      RAISE EXCEPTION 'Mensalista possui mensalidades em atraso' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- Atualizar a vaga
  UPDATE vagas
  SET 
    status = 'OCUPADA',
    placa = p_placa,
    tipo = p_tipo,
    hora_entrada = p_hora_entrada,
    hora_saida = NULL,
    valor_cobrado = NULL,
    updated_at = NOW()
  WHERE id = p_vaga_id
  RETURNING jsonb_build_object(
    'id', id,
    'categoria_id', categoria_id,
    'numero', numero,
    'status', status,
    'placa', placa,
    'tipo', tipo,
    'hora_entrada', hora_entrada,
    'hora_saida', hora_saida,
    'valor_cobrado', valor_cobrado,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_vaga_info;

  RETURN v_vaga_info;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION ocupar_vaga TO authenticated; 