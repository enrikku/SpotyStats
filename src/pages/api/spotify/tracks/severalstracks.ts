export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const tracksIds = new URL(request.url).searchParams.get("tracksIds");
  if (!tracksIds) return new Response("Missing tracks ids", { status: 400 });

  return spotifyGet(request, () => ({
    url: `https://api.spotify.com/v1/tracks?ids=${tracksIds}`,
  }));
};
