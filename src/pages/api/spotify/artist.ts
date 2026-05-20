export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const artistId = new URL(request.url).searchParams.get("id");
  if (!artistId) return new Response("Missing artist id", { status: 400 });

  return spotifyGet(request, () => ({
    url: `https://api.spotify.com/v1/artists/${artistId}`,
  }));
};
