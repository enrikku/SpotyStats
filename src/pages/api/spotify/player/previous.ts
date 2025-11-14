// src/pages/api/spotify/player/previous.ts
import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) return new Response("No session", { status: 401 });

    await spotifyRequest(
        sessionId,
        "https://api.spotify.com/v1/me/player/previous",
        { method: "POST" }
    );

    return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
    });
};
