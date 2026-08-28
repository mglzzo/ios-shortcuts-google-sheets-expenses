import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { db } from "../../db/client/Client.js";
import { usuarios } from "../../db/schema/schema.js";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definida no .env");
}

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string
) {
  const usuarioExistente = await db.query.usuarios.findFirst({
    where: (usuario, { eq }) => eq(usuario.email, email),
  });

  if (usuarioExistente) {
    throw new Error("E-mail já cadastrado");
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const [usuario] = await db
    .insert(usuarios)
    .values({
      nome,
      email,
      senhaHash,
    })
    .returning({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
    });

  return usuario;
}

export async function loginUsuario(
  identificador: string,
  senha: string
) {
  const usuario = await db.query.usuarios.findFirst({
    where: (usuario, { eq, or }) =>
      or(eq(usuario.email, identificador), eq(usuario.nome, identificador)),
  });

  if (!usuario) {
    throw new Error("E-mail, nome ou senha inválidos");
  }

  const senhaCorreta = await bcrypt.compare(
    senha,
    usuario.senhaHash
  );

  if (!senhaCorreta) {
    throw new Error("E-mail, nome ou senha inválidos");
  }

  const token = jwt.sign(
    {
      userId: usuario.id,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
  };
}

export async function obterUsuarioPorToken(token: string) {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };

    const usuario = await db.query.usuarios.findFirst({
      where: (usuario, { eq }) =>
        eq(usuario.id, payload.userId),

      columns: {
        id: true,
        nome: true,
        email: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    return usuario;
  } catch {
    throw new Error("Token inválido ou expirado");
  }
}
