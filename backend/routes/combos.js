
// backend/routes/combos.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar combos ATIVOS para o público
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM combos 
      WHERE ativa = TRUE
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar combos ativos:', error);
    res.status(500).json({ error: 'Erro ao buscar combos' });
  }
});

// Listar TODOS os combos (incluindo inativos) - Para admin
router.get('/admin', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM combos 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar combos (admin):', error);
    res.status(500).json({ error: 'Erro ao buscar combos' });
  }
});

// Buscar combo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM combos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Combo não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar combo:', error);
    res.status(500).json({ error: 'Erro ao buscar combo' });
  }
});

// Adicionar novo combo
router.post('/', async (req, res) => {
  const { 
    nome, 
    descricao, 
    imagem_url, 
    itens, 
    preco_total_sem_desconto, 
    desconto_percentual, 
    preco_final 
  } = req.body;

  if (!nome || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Nome e itens são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO combos (
        nome, descricao, imagem_url, itens, 
        preco_total_sem_desconto, desconto_percentual, preco_final, ativa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE) RETURNING *`,
      [nome, descricao, imagem_url, JSON.stringify(itens), preco_total_sem_desconto, desconto_percentual, preco_final]
    );
    
    res.json({ 
      message: 'Combo adicionado com sucesso!', 
      combo: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao criar combo:', error);
    res.status(500).json({ error: 'Erro ao criar combo' });
  }
});

// Atualizar combo existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nome, 
    descricao, 
    imagem_url, 
    itens, 
    preco_total_sem_desconto, 
    desconto_percentual, 
    preco_final,
    ativa 
  } = req.body;

  if (!nome || !itens) {
    return res.status(400).json({ error: 'Nome e itens são obrigatórios' });
  }

  try {
    await pool.query(
      `UPDATE combos 
       SET nome = $1, descricao = $2, imagem_url = $3, itens = $4, 
           preco_total_sem_desconto = $5, desconto_percentual = $6, 
           preco_final = $7, ativa = $8, updated_at = NOW()
       WHERE id = $9`,
      [nome, descricao, imagem_url, JSON.stringify(itens), preco_total_sem_desconto, desconto_percentual, preco_final, ativa, id]
    );
    
    res.json({ message: 'Combo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar combo:', error);
    res.status(500).json({ error: 'Erro ao atualizar combo' });
  }
});

// Deletar combo (soft delete - apenas desativa)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE combos SET ativa = FALSE, updated_at = NOW() WHERE id = $1', [id]);
    res.json({ message: 'Combo removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar combo:', error);
    res.status(500).json({ error: 'Erro ao remover combo' });
  }
});

export default router;