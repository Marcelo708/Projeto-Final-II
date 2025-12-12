// backend/routes/bordas.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar todas as bordas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM bordas_pizza 
      ORDER BY categoria, nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar bordas:', error);
    res.status(500).json({ error: 'Erro ao buscar bordas' });
  }
});

// Buscar configuração de preços
router.get('/configuracao', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracoes_bordas LIMIT 1');
    if (result.rows.length === 0) {
      // Criar configuração padrão se não existir
      await pool.query(`
        INSERT INTO configuracoes_bordas (preco_tradicional, multiplicador_plus, multiplicador_premium, multiplicador_doce) 
        VALUES (8.50, 1.40, 2.00, 1.30)
      `);
      return res.json({
        preco_tradicional: 8.50,
        multiplicador_plus: 1.40,
        multiplicador_premium: 2.00,
        multiplicador_doce: 1.30
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configuração de bordas:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Listar bordas agrupadas por categoria
router.get('/por-categoria', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT categoria, nome, id, descricao
      FROM bordas_pizza 
      ORDER BY 
        CASE categoria
          WHEN 'Tradicional' THEN 1
          WHEN 'Plus' THEN 2
          WHEN 'Premium' THEN 3
          WHEN 'Doce' THEN 4
        END,
        nome
    `);

    // Agrupar por categoria
    const porCategoria = result.rows.reduce((acc, borda) => {
      const categoria = borda.categoria;
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(borda);
      return acc;
    }, {});

    // Converter para array
    const resposta = Object.keys(porCategoria).map(cat => ({
      categoria: cat,
      bordas: porCategoria[cat]
    }));

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao listar bordas por categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar bordas por categoria' });
  }
});

// Adicionar nova borda
router.post('/', async (req, res) => {
  const { nome, categoria, descricao } = req.body;

  if (!nome || !categoria) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO bordas_pizza (nome, categoria, descricao) VALUES ($1, $2, $3) RETURNING *',
      [nome, categoria, descricao || null]
    );
    res.json({ 
      message: 'Borda adicionada com sucesso!',
      borda: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao adicionar borda:', error);
    res.status(500).json({ error: 'Erro ao adicionar borda' });
  }
});

// Atualizar borda existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, descricao } = req.body;

  if (!nome || !categoria) {
    return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
  }

  try {
    await pool.query(
      'UPDATE bordas_pizza SET nome = $1, categoria = $2, descricao = $3, updated_at = NOW() WHERE id = $4',
      [nome, categoria, descricao || null, id]
    );
    res.json({ message: 'Borda atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar borda:', error);
    res.status(500).json({ error: 'Erro ao atualizar borda' });
  }
});

// Deletar borda
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM bordas_pizza WHERE id = $1', [id]);
    res.json({ message: 'Borda removida com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar borda:', error);
    res.status(500).json({ error: 'Erro ao remover borda' });
  }
});
// Adicione esta rota para buscar configuração de preços de bordas
router.get('/configuracao', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracoes_bordas LIMIT 1');
    res.json(result.rows[0] || {
      preco_tradicional: 8.50,
      multiplicador_plus: 1.40,
      multiplicador_premium: 2.00,
      multiplicador_doce: 1.30
    });
  } catch (error) {
    console.error('Erro ao buscar configuração de bordas:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Adicione rota para atualizar configuração
router.put('/configuracao', async (req, res) => {
  const { preco_tradicional } = req.body;
  
  try {
    await pool.query(
      'UPDATE configuracoes_bordas SET preco_tradicional = $1, updated_at = NOW()',
      [preco_tradicional]
    );

    // Recalcular preços de todas as bordas
    await pool.query(`
      UPDATE bordas_pizza 
      SET preco_base = CASE categoria
        WHEN 'Tradicional' THEN $1
        WHEN 'Plus' THEN $1 * 1.40
        WHEN 'Premium' THEN $1 * 2.00
        WHEN 'Doce' THEN $1 * 1.30
      END
    `, [preco_tradicional]);

    res.json({ message: 'Preços atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

// Atualizar preço base e recalcular todas as bordas
router.put('/configuracao', async (req, res) => {
  const { preco_tradicional } = req.body;
  
  if (!preco_tradicional || preco_tradicional <= 0) {
    return res.status(400).json({ error: 'Preço inválido' });
  }

  try {
    // Atualizar configuração
    await pool.query(
      'UPDATE configuracoes_bordas SET preco_tradicional = $1, updated_at = NOW()',
      [preco_tradicional]
    );

    // Recalcular preços de todas as bordas
    await pool.query(`
      UPDATE bordas_pizza 
      SET preco_base = CASE categoria
        WHEN 'Tradicional' THEN $1
        WHEN 'Plus' THEN $1 * 1.40
        WHEN 'Premium' THEN $1 * 2.00
        WHEN 'Doce' THEN $1 * 1.30
      END,
      updated_at = NOW()
    `, [preco_tradicional]);

    // Retornar bordas atualizadas
    const bordasAtualizadas = await pool.query('SELECT * FROM bordas_pizza ORDER BY categoria, nome');

    res.json({ 
      message: 'Preços das bordas atualizados com sucesso!',
      preco_base: preco_tradicional,
      bordas: bordasAtualizadas.rows
    });
  } catch (error) {
    console.error('Erro ao atualizar preços das bordas:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

// Atualizar também o GET / para retornar o preço
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, categoria, descricao, preco_base
      FROM bordas_pizza 
      ORDER BY categoria, nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar bordas:', error);
    res.status(500).json({ error: 'Erro ao buscar bordas' });
  }
});

export default router;