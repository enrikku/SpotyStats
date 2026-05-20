export const runtime = "node";

import type { APIRoute } from "astro";
import { requireSpotifyAuth, jsonResponse } from "../../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  const spotifyRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });

  if (spotifyRes.status === 204) {
    return jsonResponse({ playing: false }, auth.setCookies);
  }

  const text = await spotifyRes.text();
  if (!text) return jsonResponse({ playing: false }, auth.setCookies);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return jsonResponse({ playing: false }, auth.setCookies);
  }

  if (!data || data.error) return jsonResponse({ playing: false }, auth.setCookies);

  return jsonResponse(data, auth.setCookies);
};
