// src/pages/api/spotify/player/playpause.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../../utils/spotifyAuth";

export const POST: APIRoute = async ({ request }) => {
  // Obtener token válido (auto-refresh si está expirado)
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  // Obtener estado actual del player
  const playerRes = await fetch("https://api.spotify.com/v1/me/player", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (playerRes.status === 204) {
    return new Response(JSON.stringify({ error: "No active device" }), {
      status: 400,
    });
  }

  const player = await playerRes.json();
  const isPlaying = player?.is_playing;

  const endpoint = isPlaying ? "https://api.spotify.com/v1/me/player/pause" : "https://api.spotify.com/v1/me/player/play";

  // Enviar comando PLAY o PAUSE
  await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Preparar respuesta final
  const response = new Response(JSON.stringify({ ok: true, playing: !isPlaying }), {
    headers: { "Content-Type": "application/json" },
  });

  // Añadir cookies si fueron regeneradas
  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
