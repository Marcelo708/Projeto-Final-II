--CREATE DATABASE pizzaria_db;

--\c pizzaria_db

--CREATE TABLE users (
--    id SERIAL PRIMARY KEY,
--    email VARCHAR(255) UNIQUE NOT NULL,
--    password VARCHAR(255) NOT NULL,  -- Armazene hashes, não senhas plain!
--    name VARCHAR(255)
--);

-- Insira um usuário de teste (use bcrypt para hash na produção!)
--INSERT INTO users (email, password, name) VALUES ('admin@pizzaria.com', 'Banco@123', 'Admin');