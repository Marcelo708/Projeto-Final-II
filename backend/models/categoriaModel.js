// backend/models/categoriaModel.js
import pool from '../db.js';

export const listarCategorias = async () => {
  const result = await pool.query('SELECT * FROM categorias_pizza ORDER BY id');
  return result.rows;
};

export const atualizarCategoria = async (id, preco_base) => {
  await pool.query('UPDATE categorias_pizza SET preco_base = $1 WHERE id = $2', [preco_base, id]);
};