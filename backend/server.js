// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import tamanhosRouter from "./routes/tamanhos.js";
import configuracoesRouter from "./routes/configuracoes.js";
import categoriasRouter from "./routes/categorias.js";
import saboresRouter from "./routes/sabores.js";
import bordasRouter from "./routes/bordas.js";
import promocoesRouter from "./routes/promocoes.js";
import bebidasRouter from "./routes/bebidas.js"; 
import combosRouter from "./routes/combos.js";
import usuariosRouter from "./routes/usuarios.js";


// Carrega variáveis do arquivo .env (para conexão com o banco)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rotas principais
app.use("/api/categorias", categoriasRouter);
app.use("/api/sabores", saboresRouter);
app.use("/api/tamanhos", tamanhosRouter);
app.use("/api/configuracoes", configuracoesRouter);
app.use("/api/bordas", bordasRouter);
app.use("/api/promocoes", promocoesRouter);
app.use("/api/bebidas", bebidasRouter); 
app.use("/api/combos", combosRouter);
app.use("/api/usuarios", usuariosRouter);

// Rota raiz de teste rápido
app.get("/", (req, res) => {
  res.send("🍕 API da Pizzaria funcionando corretamente!");
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
});
