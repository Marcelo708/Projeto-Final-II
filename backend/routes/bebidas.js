// backend/routes/bebidas.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar bebidas ATIVAS para o público
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM bebidas 
      WHERE ativa = TRUE
      ORDER BY nome ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar bebidas ativas:', error);
    res.status(500).json({ error: 'Erro ao buscar bebidas' });
  }
});

// Listar TODAS as bebidas (incluindo inativas) - Para admin
router.get('/admin', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM bebidas 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar bebidas (admin):', error);
    res.status(500).json({ error: 'Erro ao buscar bebidas' });
  }
});

// Buscar bebida por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM bebidas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bebida não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar bebida:', error);
    res.status(500).json({ error: 'Erro ao buscar bebida' });
  }
});

// Adicionar nova bebida
router.post('/', async (req, res) => {
  const { nome, descricao, imagem_url, preco } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bebidas (nome, descricao, imagem_url, preco, ativa) 
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [nome, descricao, imagem_url, preco]
    );
    
    res.json({ 
      message: 'Bebida adicionada com sucesso!', 
      bebida: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao criar bebida:', error);
    res.status(500).json({ error: 'Erro ao criar bebida' });
  }
});

// Atualizar bebida existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, imagem_url, preco, ativa } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  try {
    await pool.query(
      `UPDATE bebidas 
       SET nome = $1, descricao = $2, imagem_url = $3, preco = $4, ativa = $5, updated_at = NOW()
       WHERE id = $6`,
      [nome, descricao, imagem_url, preco, ativa, id]
    );
    
    res.json({ message: 'Bebida atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar bebida:', error);
    res.status(500).json({ error: 'Erro ao atualizar bebida' });
  }
});

// Deletar bebida (soft delete - apenas desativa)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE bebidas SET ativa = FALSE, updated_at = NOW() WHERE id = $1', [id]);
    res.json({ message: 'Bebida removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar bebida:', error);
    res.status(500).json({ error: 'Erro ao remover bebida' });
  }
});

export default router;