CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
    cnpj TEXT NOT NULL CHECK (
        length(cnpj) = 14
        AND cnpj NOT GLOB '*[^0-9]*'
    )
);

CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
    quantidade_estoque INTEGER NOT NULL CHECK (
        typeof(quantidade_estoque) = 'integer'
        AND quantidade_estoque >= 0
    ),
    fornecedor_id INTEGER NOT NULL,
    FOREIGN KEY (fornecedor_id)
        REFERENCES fornecedores(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor
    ON produtos(fornecedor_id);