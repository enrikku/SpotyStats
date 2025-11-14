// src/pages/api/spotify/add-tracks.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
    // Leer cookie
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    // Leer el body con playlistId y array de uris
    const body = await request.json();
    const playlistId = body.playlistId;
    const uris = body.uris;

    if (!playlistId || !Array.isArray(uris) || uris.length === 0) {
        return new Response("Invalid body", { status: 400 });
    }

    // Llamada a Spotify
    const result = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
            method: "POST",
            body: JSON.stringify({ uris })
        }
    );

    return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" }
    });
};
