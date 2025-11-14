// src/pages/api/spotify/artist.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";

export const GET: APIRoute = async ({ request }) => {
  // Obtener token válido (renueva automáticamente si está caducado)
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  // Obtener parámetro ?id=xxxx
  const url = new URL(request.url);
  const artistId = url.searchParams.get("id");

  if (!artistId) {
    return new Response("Missing artist id", { status: 400 });
  }

  // Llamada directa a Spotify
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await res.json();

  // Preparar respuesta
  const response = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });

  // Si hay cookies nuevas (token refrescado), añadirlas
  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
