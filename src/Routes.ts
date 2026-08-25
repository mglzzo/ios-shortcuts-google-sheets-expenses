import { Router } from "express";
import {
  cadastrarUsuario,
  loginUsuario,
} from "./auth/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuario = await cadastrarUsuario(nome, email, senha);

    res.status(201).json({ usuario });
  } catch (erro) {
    res.status(400).json({
      erro: erro instanceof Error ? erro.message : "Erro ao cadastrar usuário",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identificador, email, nome, senha } = req.body;
    const login = identificador ?? email ?? nome;

    if (!login || !senha) {
      res.status(400).json({
        erro: "Informe identificador (e-mail ou nome) e senha",
      });
      return;
    }

    const resultado = await loginUsuario(login, senha);

    res.status(200).json(resultado);
  } catch (erro) {
    res.status(401).json({
      erro: erro instanceof Error ? erro.message : "Falha no login",
    });
  }
});

export default router;
