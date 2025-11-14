

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";
import { getSession, refreshAccessToken } from "../../../utils/spotifySession";

export const GET: APIRoute = async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    const url = new URL(request.url);
    const timeRange = url.searchParams.get("time_range") ?? "medium_term";


    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    const data = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`,
    );

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
};
