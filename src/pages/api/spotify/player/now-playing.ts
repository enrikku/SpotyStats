// src/pages/api/spotify/player/now-playing.ts
import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../../utils/spotifyAuth";

export const runtime = "node";

export const GET: APIRoute = async ({ request }) => {
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) return new Response("NO_AUTH", { status: 401 });

  const data = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  ).then((r) => r.json());

  const res = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

  // Si hubo refresh, actualiza cookies

  if (setCookies) {
    for (const c of setCookies) {
      res.headers.append("Set-Cookie", c);
    }
  }

  return res;
};
