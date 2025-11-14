// src/utils/spotifyApi.ts
import { getSession, refreshAccessToken } from "./spotifySession";

export async function spotifyRequest(sessionId: string, url: string, options = {}) {
  let session = getSession(sessionId);

  if (!session) {
    return { error: "NO_SESSION" };
  }

  // refrescar si ha expirado
  if (Date.now() > session.expiresAt) {
    session = await refreshAccessToken(session);
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (res.status === 204) return null;

  const text = await res.text();

  // Si está vacío, no hay nada que parsear
  if (!text) return null;

  // Intentar parsear JSON; si falla devolver texto plano
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
