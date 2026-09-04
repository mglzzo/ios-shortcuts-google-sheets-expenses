import { Router } from "express";

import {
  cadastrarUsuario,
  loginUsuario,
  obterUsuarioPorToken,
} from "./auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuario = await cadastrarUsuario(
      nome,
      email,
      senha
    );

    return res.status(201).json(usuario);
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao cadastrar usuário";

    return res.status(400).json({
      erro: mensagem,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identificador, senha } = req.body;

    const resultado = await loginUsuario(
      identificador,
      senha
    );

    return res.json(resultado);
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao realizar login";

    return res.status(401).json({
      erro: mensagem,
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado",
      });
    }

    const token =
      authorization.replace(
        "Bearer ",
        ""
      );

    const usuario =
      await obterUsuarioPorToken(token);

    return res.json(usuario);
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Token inválido";

    return res.status(401).json({
      erro: mensagem,
    });
  }
});

export default router;