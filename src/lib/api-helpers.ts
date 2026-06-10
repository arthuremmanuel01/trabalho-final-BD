import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export type ApiSuccessResponse<T> = {
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  error: string;
  rule?: string;
  violations?: string[];
};

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ data, message } satisfies ApiSuccessResponse<T>, { status });
}

export function errorResponse(error: string, status: number, extra?: Partial<ApiErrorResponse>) {
  return NextResponse.json({ error, ...extra } satisfies ApiErrorResponse, { status });
}

export function notFound(entity = 'Registro') {
  return errorResponse(`${entity} não encontrado.`, 404);
}

export function badRequest(message: string) {
  return errorResponse(message, 400);
}

export function internalError(context: string, err: unknown) {
  console.error(`[${context}]`, err);
  return errorResponse('Erro interno do servidor.', 500);
}

export function businessRuleViolation(message: string, rule: string, violations?: string[]) {
  return NextResponse.json(
    { error: message, rule, violations: violations ?? [message] } satisfies ApiErrorResponse,
    { status: 422 }
  );
}

export function requireAdmin(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('Authorization'));
  if (!token) return errorResponse('Token não fornecido.', 401);
  try {
    const payload = verifyToken(token);
    if (payload.perfil !== 'admin') {
      return errorResponse('Acesso negado. Apenas administradores podem realizar esta ação.', 403);
    }
    return null;
  } catch (error) {
    return errorResponse('Token inválido ou expirado.', 401);
  }
}
