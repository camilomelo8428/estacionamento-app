-- Criar função para liberar vaga de forma atômica
CREATE OR REPLACE FUNCTION liberar_vaga(
  p_vaga_id UUID,
  p_hora_saida TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vaga_info JSONB;
  v_resultado JSONB;
BEGIN
  -- Obter informações da vaga e bloquear para atualização
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

  IF (v_vaga_info->>'status')::TEXT != 'OCUPADA' THEN
    RAISE EXCEPTION 'Vaga não está ocupada' USING ERRCODE = 'P0001';
  END IF;

  -- Liberar a vaga
  UPDATE vagas v
  SET 
    status = 'LIVRE',
    placa = NULL,
    tipo = NULL,
    hora_saida = p_hora_saida,
    hora_entrada = NULL,
    valor_cobrado = NULL
  WHERE v.id = p_vaga_id
  RETURNING jsonb_build_object(
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
  ) INTO v_resultado;

  IF v_resultado IS NULL THEN
    RAISE EXCEPTION 'Erro ao atualizar vaga' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_resultado;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION liberar_vaga TO authenticated; 