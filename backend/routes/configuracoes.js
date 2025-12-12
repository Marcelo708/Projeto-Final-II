// backend/routes/configuracoes.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Buscar configuração específica
router.get('/:chave', async (req, res) => {
  const { chave } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM configuracoes WHERE chave = $1',
      [chave]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Atualizar configuração específica
router.put('/:chave', async (req, res) => {
  const { chave } = req.params;
  const { valor } = req.body;

  if (valor === undefined || valor === null) {
    return res.status(400).json({ error: 'Valor não fornecido' });
  }

  try {
    await pool.query(
      'UPDATE configuracoes SET valor = $1, updated_at = NOW() WHERE chave = $2',
      [valor, chave]
    );

    res.json({ 
      message: 'Configuração atualizada com sucesso!',
      chave: chave,
      valor: valor
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
});

export default router;