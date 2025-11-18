// src/pages/api/spotify/add-tracks.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";

export const POST: APIRoute = async ({ request }) => {
  // Obtener token válido (refresh si ha caducado)
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  // Leer el body
  const body = await request.json();
  const playlistId = body.playlistId;
  const uris: string[] = body.uris;

  if (!playlistId || !Array.isArray(uris) || uris.length === 0) {
    return new Response("Invalid body", { status: 400 });
  }

  // Añadir tracks a playlist
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });

  const result = await res.json();

  // Crear respuesta final
  const response = new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });

  // Añadir cookies si hubo refresh del token
  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
