export const runtime = "node";

import type { APIRoute } from "astro";
import { requireSpotifyAuth, jsonResponse } from "../../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  const playerRes = await fetch("https://api.spotify.com/v1/me/player", {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });

  if (playerRes.status === 204) {
    return new Response(JSON.stringify({ error: "No active device" }), { status: 400 });
  }

  const player = await playerRes.json();
  const isPlaying = player?.is_playing;

  const endpoint = isPlaying
    ? "https://api.spotify.com/v1/me/player/pause"
    : "https://api.spotify.com/v1/me/player/play";

  await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });

  return jsonResponse({ ok: true, playing: !isPlaying }, auth.setCookies);
};
