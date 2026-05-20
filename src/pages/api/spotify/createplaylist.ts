export const runtime = "node";

import type { APIRoute } from "astro";
import { requireSpotifyAuth, jsonResponse } from "../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
  const auth = await requireSpotifyAuth(request);
  if (auth instanceof Response) return auth;

  if (!auth.userId) {
    return new Response("User ID not found", { status: 500 });
  }

  const body = await request.json();
  const name = body.name ?? "Nueva Playlist";
  const description = body.description ?? "";
  const isPublic = body.public ?? false;

  const createRes = await fetch(`https://api.spotify.com/v1/users/${auth.userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description, public: isPublic }),
  });

  const created = await createRes.json();
  return jsonResponse(created, auth.setCookies);
};
