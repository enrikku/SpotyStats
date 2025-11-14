// export const runtime = "node";

// import type { APIRoute } from "astro";
// import { spotifyRequest } from "../../../utils/spotifyApi";

// export const GET: APIRoute = async ({ request }) => {
//     console.log("Handling Spotify profile request");
//     const cookie = request.headers.get("cookie");    
//     const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

//     if (!sessionId) {
//         return new Response("No session", { status: 401 });
//     }

//     const data = await spotifyRequest(
//         sessionId,
//         "https://api.spotify.com/v1/me"
//     );

//     return new Response(JSON.stringify(data), {
//         headers: { "Content-Type": "application/json" }
//     });
// };

export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
    console.log("Handling Spotify profile request");

    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    // --------------------------------------
    // 🔥 Clave de caché
    // --------------------------------------
    const cacheKey = `profile:${sessionId}`;
    const cached = getCache(cacheKey);

    if (cached) {
        console.log("Serving profile from cache for key:", cacheKey);
        return new Response(JSON.stringify(cached), {
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
    }

    // --------------------------------------
    // ❌ No hay caché → pedir a Spotify
    // --------------------------------------
    const data = await spotifyRequest(sessionId, "https://api.spotify.com/v1/me");

    // Guardar en caché 5 minutos
    setCache(cacheKey, data, 300);

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });
};
