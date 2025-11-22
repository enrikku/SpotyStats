// src/pages/api/spotify/tracks/severalstracks.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../../utils/spotifyAuth";

export const GET: APIRoute = async ({ request }) => {
  const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

  if (error) {
    return new Response("NO_AUTH", { status: 401 });
  }

  const url = new URL(request.url);
  const tracksIds = url.searchParams.get("tracksIds");

  if (!tracksIds) {
    return new Response("Missing tracks ids", { status: 400 });
  }

  // Construir URL correcta a Spotify
  const spotifyUrl = `https://api.spotify.com/v1/tracks?ids=${tracksIds}`;

  const res = await fetch(spotifyUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();

  const response = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

  if (setCookies) {
    for (const c of setCookies) {
      response.headers.append("Set-Cookie", c);
    }
  }

  return response;
};
