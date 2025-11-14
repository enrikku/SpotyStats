// src/pages/api/spotify/player/next.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../../utils/spotifyAuth";

export const POST: APIRoute = async ({ request }) => {
  // Obtener token válido (auto-refresh si expira)
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  // Llamar al endpoint NEXT de Spotify
  await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  // Preparar respuesta
  const response = new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });

  // Incluir cookies nuevas si el token fue refrescado
  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
