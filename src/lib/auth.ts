import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'horarios_academicos_fallback_secret';
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  id: number;
  email: string;
  nome: string;
  perfil: string;
}

/**
 * Gera um token JWT para o usuário autenticado.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica um token JWT.
 * Lança erro se o token for inválido ou expirado.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Gera hash bcrypt para uma senha em texto plano.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compara senha em texto plano com o hash armazenado.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extrai o token do header Authorization (Bearer <token>).
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
