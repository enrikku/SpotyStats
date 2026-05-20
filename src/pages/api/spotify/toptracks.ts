export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const timeRange = new URL(request.url).searchParams.get("time_range") ?? "medium_term";
  return spotifyGet(request, (userId) => ({
    url: `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`,
    cacheKey: `toptracks:${userId}:${timeRange}`,
  }));
};
