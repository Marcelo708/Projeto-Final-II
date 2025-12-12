CREATE TABLE categorias_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  preco_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE sabores_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  categoria_id INT REFERENCES categorias_pizza(id)
);

-- Dados iniciais
INSERT INTO categorias_pizza (nome, preco_base) VALUES
('Tradicional', 39.90),
('Plus', 45.67),
('Premium', 54.31),
('Doce', 54.31),
('Doce Premium', 59.06);

INSERT INTO sabores_pizza (nome, categoria_id) VALUES
('Calabresa', 1),
('Portuguesa', 2),
('Cinco Queijos', 3),
('Chocolate Preto', 4),
('Chocolate Branco', 5);

ALTER TABLE sabores_pizza 
ADD COLUMN descricao TEXT;


SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'sabores_pizza';


------------------

-- Tabela de bordas
CREATE TABLE IF NOT EXISTS bordas_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir bordas padrão
INSERT INTO bordas_pizza (nome, categoria, descricao) VALUES
('Sem Borda', 'Tradicional', 'Pizza sem borda recheada'),
('Catupiry', 'Tradicional', 'Borda recheada com catupiry'),
('Mussarela', 'Tradicional', 'Borda recheada com queijo mussarela'),
('Cheddar', 'Plus', 'Borda recheada com queijo cheddar'),
('Cream Cheese', 'Premium', 'Borda recheada com cream cheese'),
('Chocolate', 'Doce', 'Borda recheada com chocolate ao leite'),
('Chocolate Branco', 'Doce', 'Borda recheada com chocolate branco'),
('Doce de Leite', 'Doce', 'Borda recheada com doce de leite');

--------------------------------------------------------------------------
-- Adicionar coluna de preço nas bordas
ALTER TABLE bordas_pizza 
ADD COLUMN preco_base DECIMAL(10,2) DEFAULT 8.50;

-- Criar tabela de configuração de preços de bordas
CREATE TABLE IF NOT EXISTS configuracoes_bordas (
  id SERIAL PRIMARY KEY,
  preco_tradicional DECIMAL(10,2) NOT NULL DEFAULT 8.50,
  multiplicador_plus DECIMAL(5,2) NOT NULL DEFAULT 1.40,
  multiplicador_premium DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  multiplicador_doce DECIMAL(5,2) NOT NULL DEFAULT 1.30,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO configuracoes_bordas (preco_tradicional, multiplicador_plus, multiplicador_premium, multiplicador_doce) 
VALUES (8.50, 1.40, 2.00, 1.30);

-- Atualizar preços das bordas existentes baseado na categoria
UPDATE bordas_pizza 
SET preco_base = CASE categoria
  WHEN 'Tradicional' THEN 8.50
  WHEN 'Plus' THEN 8.50 * 1.40
  WHEN 'Premium' THEN 8.50 * 2.00
  WHEN 'Doce' THEN 8.50 * 1.30
END;

------------------------------------------------------------
-- backend/database/promocoes.sql
CREATE TABLE IF NOT EXISTS promocoes_semana (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  tamanho_pizza_id INT REFERENCES tamanhos_pizza(id),
  desconto_percentual DECIMAL(5,2) NOT NULL CHECK (desconto_percentual IN (10, 15, 20, 25, 35)),
  sabores_inclusos TEXT[], -- Array de nomes de sabores
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir promoção de exemplo
INSERT INTO promocoes_semana (nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos, ativa) VALUES
('Super Terça', 'Todas as pizzas grandes com 25% OFF!', 'https://example.com/promo1.jpg', 2, 25, ARRAY['Calabresa', 'Mussarela', 'Portuguesa'], TRUE),
('Combo Família', 'Pizza Família + Refrigerante com 20% de desconto', 'https://example.com/promo2.jpg', 3, 20, ARRAY['Frango com Catupiry', 'Margherita'], TRUE);



--------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------


-- Tabela de tamanhos de pizza
CREATE TABLE IF NOT EXISTS tamanhos_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  tamanho_cm INT NOT NULL,
  max_sabores INT NOT NULL DEFAULT 4,
  multiplicador DECIMAL(5,2) NOT NULL,
  preco_atual DECIMAL(10,2),
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tamanhos padrão
INSERT INTO tamanhos_pizza (nome, tamanho_cm, max_sabores, multiplicador, preco_atual, descricao) VALUES
('Pequena', 25, 2, 1.00, 39.90, '4 fatias - Ideal para 1 pessoa'),
('Grande', 35, 3, 1.30, 51.87, '8 fatias - Ideal para 2-3 pessoas'),
('Família', 40, 4, 1.64, 65.36, '12 fatias - Ideal para 3-4 pessoas'),
('Super Família', 45, 4, 1.97, 78.43, '16 fatias - Ideal para 4-6 pessoas');

-- Tabela de configurações gerais
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração do preço base
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('preco_base_pequena', 39.90, 'Preço base da pizza pequena (categoria Tradicional)')
ON CONFLICT (chave) DO NOTHING;

-- ✅ Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('tamanhos_pizza', 'configuracoes', 'promocoes_semana');

Select * from promocoes_semana;

-- Deletar promoções
DELETE FROM promocoes_semana;

-- Deletar tamanhos
DELETE FROM tamanhos_pizza;

-- Resetar ID
ALTER SEQUENCE tamanhos_pizza_id_seq RESTART WITH 1;

-- Inserir tamanhos corretos
INSERT INTO tamanhos_pizza (nome, tamanho_cm, max_sabores, multiplicador, preco_atual, descricao) VALUES
('Pequena', 25, 2, 1.00, 39.90, '4 fatias - Ideal para 1 pessoa'),
('Grande', 35, 3, 1.30, 51.87, '8 fatias - Ideal para 2-3 pessoas'),
('Família', 40, 4, 1.64, 65.36, '12 fatias - Ideal para 3-4 pessoas'),
('Super Família', 45, 4, 1.97, 78.43, '16 fatias - Ideal para 4-6 pessoas');




----------------------------------------------------------------------------------
----------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS combos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  itens JSONB NOT NULL,
  preco_total_sem_desconto DECIMAL(10,2) NOT NULL,
  desconto_percentual DECIMAL(5,2) NOT NULL CHECK (desconto_percentual IN (10, 15, 20)),
  preco_final DECIMAL(10,2) NOT NULL,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para consultas mais rápidas
CREATE INDEX idx_combos_ativa ON combos(ativa);

--
SELECT * FROM categorias_pizza;


----------------------------------------------------------------------------------
----------------------------------------------------------------------------------


-- ============================================
-- SISTEMA DE USUÁRIOS E PERFIL
-- ============================================

-- Tabela de Usuários (Login)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  celular VARCHAR(20) NOT NULL,
  senha VARCHAR(255) NOT NULL, -- Será armazenada com bcrypt
  role VARCHAR(20) DEFAULT 'user', -- 'user' ou 'admin'
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Perfil do Usuário (Informações Adicionais)
CREATE TABLE IF NOT EXISTS perfil_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  
  -- Endereço
  cep VARCHAR(10),
  rua VARCHAR(255),
  numero VARCHAR(10),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  taxa_entrega DECIMAL(10,2) DEFAULT 0,
  
  -- Pizza Favorita
  pizza_favorita_tamanho VARCHAR(50),
  pizza_favorita_sabores TEXT[], -- Array de sabores
  pizza_favorita_borda VARCHAR(100),
  
  -- Preferências
  observacoes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_celular ON usuarios(celular);
CREATE INDEX idx_perfil_usuario_id ON perfil_usuario(usuario_id);

-- Inserir usuário ADMIN padrão (senha: 1234)
-- Senha hasheada com bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO usuarios (nome, email, celular, senha, role) VALUES
('Administrador', 'admin@pizzaria.com', '51999999999', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('usuarios', 'perfil_usuario');


SELECT email, role, ativo FROM usuarios WHERE email = 'admin@pizzaria.com';


INSERT INTO usuarios (nome, email, celular, senha, role, ativo) VALUES
('Administrador', 'admin@pizzaria.com', '51999999999', 
'$2b$10$UnkzxYWSgBS4DxIB0E7sJO5DvpHp0QYTPcNjUlvBTkB/L0EG2SiQC', 'admin', TRUE)
RETURNING id, nome, email, celular, role;


INSERT INTO perfil_usuario (usuario_id) 
SELECT id FROM usuarios WHERE email = 'admin@pizzaria.com';


DELETE FROM usuarios WHERE email = 'admin@pizzaria.com';