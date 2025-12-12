// backend/routes/promocoes.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar promoções ATIVAS para o público (rota padrão)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        t.nome AS tamanho_nome,
        COALESCE(t.preco_atual, 0) AS preco_original
      FROM promocoes_semana p
      LEFT JOIN tamanhos_pizza t ON p.tamanho_pizza_id = t.id
      WHERE p.ativa = TRUE
      ORDER BY p.created_at DESC
    `);
    
    const promocoes = result.rows.map(p => ({
      ...p,
      preco_original: parseFloat(p.preco_original) || 0,
      desconto_percentual: parseFloat(p.desconto_percentual) || 0,
      preco_promocional: (parseFloat(p.preco_original) || 0) * (1 - (parseFloat(p.desconto_percentual) || 0) / 100)
    }));

    res.json(promocoes);
  } catch (error) {
    console.error('Erro ao listar promoções ativas:', error);
    res.status(500).json({ error: 'Erro ao buscar promoções' });
  }
});

// Listar TODAS as promoções (incluindo inativas) - Para admin
router.get('/admin', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        t.nome AS tamanho_nome,
        COALESCE(t.preco_atual, 0) AS preco_original
      FROM promocoes_semana p
      LEFT JOIN tamanhos_pizza t ON p.tamanho_pizza_id = t.id
      ORDER BY p.created_at DESC
    `);
    
    const promocoes = result.rows.map(p => ({
      ...p,
      preco_original: parseFloat(p.preco_original) || 0,
      desconto_percentual: parseFloat(p.desconto_percentual) || 0,
      preco_promocional: (parseFloat(p.preco_original) || 0) * (1 - (parseFloat(p.desconto_percentual) || 0) / 100)
    }));

    res.json(promocoes);
  } catch (error) {
    console.error('Erro ao listar promoções (admin):', error);
    res.status(500).json({ error: 'Erro ao buscar promoções' });
  }
});

// Buscar promoção por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, t.nome AS tamanho_nome, t.preco_atual AS preco_original
      FROM promocoes_semana p
      LEFT JOIN tamanhos_pizza t ON p.tamanho_pizza_id = t.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar promoção:', error);
    res.status(500).json({ error: 'Erro ao buscar promoção' });
  }
});

// Adicionar nova promoção
router.post('/', async (req, res) => {
  const { nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos } = req.body;

  if (!nome || !tamanho_pizza_id || !desconto_percentual) {
    return res.status(400).json({ error: 'Nome, tamanho e desconto são obrigatórios' });
  }

  const descontosPermitidos = [10, 15, 20, 25, 35];
  if (!descontosPermitidos.includes(parseFloat(desconto_percentual))) {
    return res.status(400).json({ error: 'Desconto deve ser 10, 15, 20, 25 ou 35%' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO promocoes_semana (nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos, ativa) 
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *`,
      [nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos || []]
    );
    res.json({ message: 'Promoção criada com sucesso!', promocao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    res.status(500).json({ error: 'Erro ao criar promoção' });
  }
});

// Atualizar promoção existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos, ativa } = req.body;

  try {
    await pool.query(
      `UPDATE promocoes_semana 
       SET nome = $1, descricao = $2, imagem_url = $3, tamanho_pizza_id = $4, 
           desconto_percentual = $5, sabores_inclusos = $6, ativa = $7, updated_at = NOW()
       WHERE id = $8`,
      [nome, descricao, imagem_url, tamanho_pizza_id, desconto_percentual, sabores_inclusos, ativa, id]
    );
    res.json({ message: 'Promoção atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    res.status(500).json({ error: 'Erro ao atualizar promoção' });
  }
});

// Deletar promoção (soft delete - apenas desativa)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE promocoes_semana SET ativa = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Promoção removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    res.status(500).json({ error: 'Erro ao remover promoção' });
  }
});

export default router;