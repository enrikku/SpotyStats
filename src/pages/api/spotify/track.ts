export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    // Obtener query param ?id=xxxx
    const url = new URL(request.url);
    const trackId = url.searchParams.get("id");

    if (!trackId) {
        return new Response("Missing track id", { status: 400 });
    }

    // Llamada a Spotify
    const data = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/tracks/${trackId}`
    );

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
    });
};
