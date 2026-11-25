ALTER TABLE public.fornecedores
ADD CONSTRAINT uq_fornecedores_cnpj
UNIQUE (cnpj);
