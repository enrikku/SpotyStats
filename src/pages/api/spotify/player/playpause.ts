// src/pages/api/spotify/player/playpause.ts
import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    console.log("Session ID:", sessionId);
    if (!sessionId) return new Response("No session", { status: 401 });

    // Primero obtenemos el estado actual del player
    const player = await spotifyRequest(
        sessionId,
        "https://api.spotify.com/v1/me/player"
    );

    if (!player) {
        return new Response(JSON.stringify({ error: "No active device" }), {
            status: 400
        });
    }

    const isPlaying = player.is_playing;

    const endpoint = isPlaying
        ? "https://api.spotify.com/v1/me/player/pause"
        : "https://api.spotify.com/v1/me/player/play";

    const res = await spotifyRequest(sessionId, endpoint, { method: "PUT" });

    return new Response(JSON.stringify({ ok: true, playing: !isPlaying }), {
        headers: { "Content-Type": "application/json" }
    });
};
