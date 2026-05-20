export const runtime = "node";

import type { APIRoute } from "astro";
import { requireSpotifyAuth, jsonResponse } from "../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const playlistId = body.playlistId;
  const uris: string[] = body.uris;

  if (!playlistId || !Array.isArray(uris) || uris.length === 0) {
    return new Response("Invalid body", { status: 400 });
  }

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });

  const result = await res.json();
  return jsonResponse(result, auth.setCookies);
};
