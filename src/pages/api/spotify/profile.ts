import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";
import { getSession, refreshAccessToken } from "../../../utils/spotifySession";

export const GET: APIRoute = async ({ request }) => {
    console.log("Handling Spotify profile request");
    const cookie = request.headers.get("cookie");    
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    const data = await spotifyRequest(
        sessionId,
        "https://api.spotify.com/v1/me"
    );

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
};
