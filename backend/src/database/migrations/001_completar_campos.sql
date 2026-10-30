ALTER TABLE public.fornecedores
    ADD COLUMN IF NOT EXISTS telefone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS email VARCHAR(254),
    ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ
        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ
        NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.produtos
    ADD COLUMN IF NOT EXISTS descricao TEXT,
    ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ
        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ
        NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION public.atualizar_datas_registro()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.criado_em := OLD.criado_em;
    NEW.atualizado_em := statement_timestamp();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fornecedores_atualizar_datas
    ON public.fornecedores;

CREATE TRIGGER trg_fornecedores_atualizar_datas
BEFORE UPDATE ON public.fornecedores
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_datas_registro();

DROP TRIGGER IF EXISTS trg_produtos_atualizar_datas
    ON public.produtos;

CREATE TRIGGER trg_produtos_atualizar_datas
BEFORE UPDATE ON public.produtos
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_datas_registro();