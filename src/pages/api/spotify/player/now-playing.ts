// src/pages/api/spotify/player/now-playing.ts
import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../../utils/spotifyAuth";

export const runtime = "node";

export const GET: APIRoute = async ({ request }) => {
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) return new Response("NO_AUTH", { status: 401 });

  const resSpotify = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  // ---- ⚠️ SI NO HAY NADA SONANDO → 204 ----
  if (resSpotify.status === 204) {
    return new Response(JSON.stringify({ playing: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // ---- ⚠️ Si no hay body ----
  const text = await resSpotify.text();
  if (!text) {
    return new Response(JSON.stringify({ playing: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // ---- Parsear seguro ----
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  // ---- Si Spotify devuelve error interno ----
  if (!data || data.error) {
    return new Response(JSON.stringify({ playing: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // ---- Respuesta final ----
  const response = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });

  // ---- Refrescar cookies si toca ----
  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
