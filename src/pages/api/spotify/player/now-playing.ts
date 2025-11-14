import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
  const sessionId = request.headers.get("cookie")?.match(/sessionId=([^;]+)/)?.[1];
  if (!sessionId) return new Response("No session", { status: 401 });

  const data = await spotifyRequest(sessionId, "https://api.spotify.com/v1/me/player/currently-playing");

  if (!data || data?.error) {
    return new Response(JSON.stringify({ playing: false }));
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};
