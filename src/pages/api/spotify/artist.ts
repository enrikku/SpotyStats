export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";

export const GET: APIRoute = async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    // Obtener el parámetro ?id=xxxx
    const url = new URL(request.url);
    const artistId = url.searchParams.get("id");

    if (!artistId) {
        return new Response("Missing artist id", { status: 400 });
    }

    // Llamar al endpoint de Spotify
    const data = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/artists/${artistId}`
    );

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
};
