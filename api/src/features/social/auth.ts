import type { Request } from "express";

export type AuthenticatedUser = {
  id: string;
  accessToken: string;
};

export type AuthResolver = (request: Request) => Promise<AuthenticatedUser | null>;

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}
