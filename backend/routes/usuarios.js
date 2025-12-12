// backend/routes/usuarios.js
import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';

const router = express.Router();

// ============================================
// AUTENTICAÇÃO
// ============================================

// Cadastro de novo usuário
router.post('/cadastro', async (req, res) => {
  const { nome, email, celular, senha } = req.body;

  // Validação básica
  if (!nome || !email || !celular || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    // Verificar se email já existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, celular, senha, role) 
       VALUES ($1, $2, $3, $4, 'user') 
       RETURNING id, nome, email, celular, role`,
      [nome, email, celular, senhaHash]
    );

    const novoUsuario = resultado.rows[0];

    // Criar perfil vazio
    await pool.query(
      'INSERT INTO perfil_usuario (usuario_id) VALUES ($1)',
      [novoUsuario.id]
    );

    res.json({
      message: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario
    });
  } catch (error) {
    console.error('❌ Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Buscar usuário por email
    const resultado = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND ativo = TRUE',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = resultado.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Retornar dados do usuário (SEM a senha)
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      message: 'Login realizado com sucesso!',
      usuario: usuarioSemSenha
    });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ============================================
// PERFIL DO USUÁRIO
// ============================================

// Buscar perfil completo do usuário
router.get('/perfil/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  try {
    // Buscar dados do usuário
    const usuario = await pool.query(
      'SELECT id, nome, email, celular, role FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar perfil adicional
    const perfil = await pool.query(
      'SELECT * FROM perfil_usuario WHERE usuario_id = $1',
      [usuarioId]
    );

    res.json({
      usuario: usuario.rows[0],
      perfil: perfil.rows[0] || null
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil do usuário
router.put('/perfil/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  const {
    cep, rua, numero, complemento, bairro, cidade, estado, taxa_entrega,
    pizza_favorita_tamanho, pizza_favorita_sabores, pizza_favorita_borda,
    observacoes
  } = req.body;

  try {
    // Verificar se perfil existe
    const perfilExistente = await pool.query(
      'SELECT id FROM perfil_usuario WHERE usuario_id = $1',
      [usuarioId]
    );

    if (perfilExistente.rows.length === 0) {
      // Criar perfil se não existir
      await pool.query(
        'INSERT INTO perfil_usuario (usuario_id) VALUES ($1)',
        [usuarioId]
      );
    }

    // Atualizar perfil
    await pool.query(
      `UPDATE perfil_usuario 
       SET cep = $1, rua = $2, numero = $3, complemento = $4, bairro = $5, 
           cidade = $6, estado = $7, taxa_entrega = $8,
           pizza_favorita_tamanho = $9, pizza_favorita_sabores = $10, 
           pizza_favorita_borda = $11, observacoes = $12,
           updated_at = NOW()
       WHERE usuario_id = $13`,
      [
        cep, rua, numero, complemento, bairro, cidade, estado, taxa_entrega,
        pizza_favorita_tamanho, pizza_favorita_sabores, pizza_favorita_borda,
        observacoes, usuarioId
      ]
    );

    res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// ============================================
// ADMIN - Gerenciar Usuários
// ============================================

// Listar todos os usuários (ADMIN)
router.get('/admin/listar', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT u.id, u.nome, u.email, u.celular, u.role, u.ativo, u.created_at,
             p.cidade, p.bairro
      FROM usuarios u
      LEFT JOIN perfil_usuario p ON u.id = p.usuario_id
      ORDER BY u.created_at DESC
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Desativar usuário (soft delete)
router.delete('/admin/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  try {
    await pool.query(
      'UPDATE usuarios SET ativo = FALSE, updated_at = NOW() WHERE id = $1',
      [usuarioId]
    );

    res.json({ message: 'Usuário desativado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao desativar usuário:', error);
    res.status(500).json({ error: 'Erro ao desativar usuário' });
  }
});

export default router;