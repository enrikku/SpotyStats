export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";

export const GET: APIRoute = async ({ request }) => {
    // Obtener token válido (refresca si hace falta)
    const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

    if (error) {
        return new Response("NO_AUTH", { status: 401 });
    }

    // Obtener el parámetro id
    const url = new URL(request.url);
    const trackId = url.searchParams.get("id");

    if (!trackId) {
        return new Response("Missing track id", { status: 400 });
    }

    // Llamada a Spotify
    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await res.json();

    // Response
    const response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });

    // Añadir nuevas cookies si hubo refresh
    if (setCookies) {
        for (const c of setCookies) {
            response.headers.append("Set-Cookie", c);
        }
    }

    return response;
};
