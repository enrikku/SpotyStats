export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const timeRange = params.get("time_range") ?? "medium_term";
  const limit = parseInt(params.get("limit") ?? "50");

  return spotifyGet(request, (userId) => ({
    url: `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
    cacheKey: `topgenres:${userId}:${timeRange}:${limit}`,
    transform: (data) => {
      const genreCount = new Map<string, number>();
      for (const artist of data.items ?? []) {
        for (const genre of artist.genres ?? []) {
          genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
        }
      }
      return Array.from(genreCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([genre, count]) => ({ genre, count }));
    },
  }));
};
