// backend/models/saborModel.js
import pool from '../db.js';

export const listarSabores = async () => {
  const result = await pool.query(`
    SELECT s.id, s.nome, c.nome AS categoria 
    FROM sabores_pizza s
    JOIN categorias_pizza c ON c.id = s.categoria_id
    ORDER BY s.id
  `);
  return result.rows;
};