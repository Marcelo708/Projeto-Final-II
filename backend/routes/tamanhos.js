// backend/routes/tamanhos.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar todos os tamanhos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM tamanhos_pizza 
      ORDER BY multiplicador ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar tamanhos:', error);
    res.status(500).json({ error: 'Erro ao buscar tamanhos' });
  }
});

// Recalcular preços baseado no valor da pequena
router.post('/recalcular', async (req, res) => {
  const { preco_base } = req.body;

  if (!preco_base || preco_base <= 0) {
    return res.status(400).json({ error: 'Preço base inválido' });
  }

  try {
    // Atualizar o preço base na tabela configuracoes
    await pool.query(
      'UPDATE configuracoes SET valor = $1, updated_at = NOW() WHERE chave = $2',
      [preco_base, 'preco_base_pequena']
    );

    // Buscar todos os tamanhos
    const tamanhos = await pool.query('SELECT * FROM tamanhos_pizza ORDER BY id');

    // Recalcular e atualizar cada tamanho
    for (const tamanho of tamanhos.rows) {
      const novoPreco = (preco_base * tamanho.multiplicador).toFixed(2);
      
      await pool.query(
        'UPDATE tamanhos_pizza SET preco_atual = $1, updated_at = NOW() WHERE id = $2',
        [novoPreco, tamanho.id]
      );
    }

    // Retornar os tamanhos atualizados
    const tamanhosAtualizados = await pool.query('SELECT * FROM tamanhos_pizza ORDER BY id');
    
    res.json({
      message: 'Preços recalculados com sucesso!',
      preco_base: preco_base,
      tamanhos: tamanhosAtualizados.rows
    });
  } catch (error) {
    console.error('Erro ao recalcular preços:', error);
    res.status(500).json({ error: 'Erro ao recalcular preços' });
  }
});

export default router;