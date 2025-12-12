// backend/routes/categorias.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar categorias
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_pizza ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Adicionar nova categoria
router.post('/', async (req, res) => {
  const { nome, preco_base } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO categorias_pizza (nome, preco_base) VALUES ($1, $2)',
      [nome, preco_base]
    );
    res.json({ message: 'Categoria adicionada com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    res.status(500).json({ error: 'Erro ao adicionar categoria' });
  }
});

// Editar categoria
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, preco_base } = req.body;
  
  try {
    await pool.query(
      'UPDATE categorias_pizza SET nome = $1, preco_base = $2 WHERE id = $3',
      [nome, preco_base, id]
    );
    res.json({ message: 'Categoria atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM categorias_pizza WHERE id = $1', [id]);
    res.json({ message: 'Categoria removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro ao remover categoria' });
  }
});

export default router;