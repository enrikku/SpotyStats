export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyGet } from "../../../utils/spotifyApi";

export const GET: APIRoute = ({ request }) =>
  spotifyGet(request, (userId) => ({
    url: "https://api.spotify.com/v1/me",
    cacheKey: `profile:${userId}`,
  }));
