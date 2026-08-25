import assert from "node:assert/strict";
import jwt, { type JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { cadastrarUsuario, loginUsuario } from "./auth.js";

const jwtSecret = process.env.JWT_SECRET;

async function testarLogin(identificadorTeste: string, senhaTeste: string, segredoJwt: string) {
  const resultado = await loginUsuario(identificadorTeste, senhaTeste);
  const payload = jwt.verify(resultado.token, segredoJwt) as JwtPayload;

  assert.ok(payload.userId, "O JWT não contém userId.");
  assert.equal(payload.userId, resultado.usuario.id, "O userId do JWT não corresponde ao usuário autenticado.");

  console.log("Login validado com sucesso.");
  console.log({ usuario: resultado.usuario, jwt: { userId: payload.userId, exp: payload.exp } });
}

async function testarRegistro(nomeTeste: string, emailTeste: string, senhaTeste: string) {
  const usuario = await cadastrarUsuario(nomeTeste, emailTeste, senhaTeste);

  assert.ok(usuario, "O cadastro não retornou o usuário criado.");
  assert.ok(usuario.id, "O usuário criado não possui id.");
  assert.equal(usuario.nome, nomeTeste, "O nome retornado está incorreto.");
  assert.equal(usuario.email, emailTeste, "O e-mail retornado está incorreto.");
  assert.ok(!("senhaHash" in usuario), "O hash da senha não deve ser retornado pelo cadastro.");

  console.log("Registro validado com sucesso.");
  console.log({ usuario });
}

async function executarTeste() {
  const teste = process.argv[2] ?? "login";

  if (teste === "registro") {
    const nome = process.env.REGISTER_TEST_NAME;
    const email = process.env.REGISTER_TEST_EMAIL;
    const senha = process.env.REGISTER_TEST_PASSWORD;

    if (!nome || !email || !senha) {
      throw new Error("Defina REGISTER_TEST_NAME, REGISTER_TEST_EMAIL e REGISTER_TEST_PASSWORD no .env.");
    }

    console.log(`Iniciando teste de registro para ${email}...`);
    await testarRegistro(nome, email, senha);
    return;
  }

  const email = process.env.LOGIN_TEST_EMAIL;
  const senha = process.env.LOGIN_TEST_PASSWORD;

  if (!email || !senha) {
    throw new Error("Defina LOGIN_TEST_EMAIL e LOGIN_TEST_PASSWORD no .env para executar o teste.");
  }

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não definida no .env.");
  }

  console.log(`Iniciando teste de login para ${email}...`);
  await testarLogin(email, senha, jwtSecret);
}

executarTeste().catch((erro: unknown) => {
  console.error("Falha no teste de autenticação:", erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});
