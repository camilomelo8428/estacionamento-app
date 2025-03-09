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
  v_categoria_id UUID;
  v_limite_vagas INTEGER;
  v_vagas_ocupadas INTEGER;
  v_total_vagas INTEGER;
  v_vaga_info JSONB;
  v_resultado JSONB;
BEGIN
  -- Obter categoria_id e verificar se a vaga existe e está livre
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

  v_categoria_id := (v_vaga_info->>'categoria_id')::UUID;

  -- Obter limite de vagas da categoria
  SELECT vagas INTO v_limite_vagas
  FROM categorias
  WHERE id = v_categoria_id;

  IF v_limite_vagas IS NULL THEN
    RAISE EXCEPTION 'Categoria não encontrada' USING ERRCODE = 'P0001';
  END IF;

  -- Contar total de vagas existentes para esta categoria
  SELECT COUNT(*) INTO v_total_vagas
  FROM vagas
  WHERE categoria_id = v_categoria_id;

  -- Contar vagas ocupadas na categoria
  SELECT COUNT(*) INTO v_vagas_ocupadas
  FROM vagas
  WHERE categoria_id = v_categoria_id AND status = 'OCUPADA';

  -- Verificar se não excede o limite
  IF v_vagas_ocupadas >= v_limite_vagas OR v_vagas_ocupadas >= v_total_vagas THEN
    RAISE EXCEPTION 'Número máximo de vagas excedido para esta categoria (Limite: %, Total Existente: %, Ocupadas: %)', 
      v_limite_vagas, v_total_vagas, v_vagas_ocupadas 
    USING ERRCODE = 'P0001';
  END IF;

  -- Ocupar a vaga
  UPDATE vagas v
  SET 
    status = 'OCUPADA',
    placa = p_placa,
    tipo = p_tipo,
    hora_entrada = p_hora_entrada
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
GRANT EXECUTE ON FUNCTION ocupar_vaga TO authenticated; 