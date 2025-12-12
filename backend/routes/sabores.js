// backend/routes/sabores.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Lista sabores com JOIN para pegar o NOME da categoria
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.nome, 
        s.descricao, 
        c.nome AS categoria,
        c.id AS categoria_id,
        c.preco_base
      FROM sabores_pizza s
      JOIN categorias_pizza c ON c.id = s.categoria_id
      ORDER BY s.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar sabores:', error);
    res.status(500).json({ error: 'Erro ao buscar sabores' });
  }
});

// Adicionar novo sabor (com descrição)
router.post('/', async (req, res) => {
  const { nome, categoria_id, descricao } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO sabores_pizza (nome, categoria_id, descricao) VALUES ($1, $2, $3)',
      [nome, categoria_id, descricao || null]
    );
    res.json({ message: 'Sabor adicionado com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar sabor:', error);
    res.status(500).json({ error: 'Erro ao adicionar sabor' });
  }
});

// Atualizar sabor existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, categoria_id, descricao } = req.body;
  
  try {
    await pool.query(
      'UPDATE sabores_pizza SET nome = $1, categoria_id = $2, descricao = $3 WHERE id = $4',
      [nome, categoria_id, descricao || null, id]
    );
    res.json({ message: 'Sabor atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar sabor:', error);
    res.status(500).json({ error: 'Erro ao atualizar sabor' });
  }
});

// Deletar sabor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM sabores_pizza WHERE id = $1', [id]);
    res.json({ message: 'Sabor removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar sabor:', error);
    res.status(500).json({ error: 'Erro ao remover sabor' });
  }
});

export default router;