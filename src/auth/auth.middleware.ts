import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

export interface RequestAutenticada
  extends Request {
  user?: {
    userId: string;
  };
}

export function autenticar(
  req: RequestAutenticada,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      erro: "Token não informado.",
    });
  }

  const [tipo, token] =
    authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      erro: "Token inválido.",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = {
      userId: payload.userId,
    };

    next();
  } catch {
    return res.status(401).json({
      erro: "Token inválido ou expirado.",
    });
  }
}