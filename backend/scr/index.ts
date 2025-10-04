import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Endpoint de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Para testar hashing (rode uma vez para inserir usuário com hash)
async function createTestUser() {
  const hashedPassword = await bcrypt.hash('senha123', 10);
  await pool.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3)', ['admin@pizzaria.com', hashedPassword, 'Admin']);
}
// createTestUser();  // Descomente para criar usuário de teste

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});