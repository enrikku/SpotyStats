export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const trackId = new URL(request.url).searchParams.get("id");
  if (!trackId) return new Response("Missing track id", { status: 400 });

  return spotifyGet(request, () => ({
    url: `https://api.spotify.com/v1/tracks/${trackId}`,
  }));
};
