import { Router } from "express";
import {
  cadastrarUsuario,
  loginUsuario,
  obterUsuarioPorToken,
} from "./auth/auth.js";

const router = Router();

router.get("/me", async (req, res) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado",
      });
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const usuario = await obterUsuarioPorToken(token);

    return res.json({
      usuario,
    });
  } catch (error) {
    return res.status(401).json({
      erro:
        error instanceof Error
          ? error.message
          : "Não autorizado",
    });
  }
});

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
