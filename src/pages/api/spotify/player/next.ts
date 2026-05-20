export const runtime = "node";

import type { APIRoute } from "astro";
import { requireSpotifyAuth, jsonResponse } from "../../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });

  return jsonResponse({ ok: true }, auth.setCookies);
};
