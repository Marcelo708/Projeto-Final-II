CREATE DATABASE pizzaria_db;

\c pizzaria_db

CREATE TABLE categorias_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  preco_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE tamanhos_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(30) NOT NULL,
  multiplicador DECIMAL(5,2) NOT NULL
);

CREATE TABLE sabores_pizza (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  categoria_id INT REFERENCES categorias_pizza(id)
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(255),
  role VARCHAR(20) DEFAULT 'cliente'
);

-- Insira um usuário de teste (use bcrypt para hash na produção!)
INSERT INTO usuarios (nome, email, senha, role)
VALUES ('Administrador', 'admin@pizzaria.com', '1234', 'admin');

ALTER TABLE sabores_pizza 
ADD COLUMN descricao TEXT;