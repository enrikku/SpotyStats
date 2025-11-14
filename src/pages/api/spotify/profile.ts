export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";
import { getCache, setCache } from "../../../utils/cache";

export const GET: APIRoute = async ({ request }) => {
    console.log("Handling Spotify profile request");

    // Obtener token válido (refresca si hace falta)
    const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

    if (error) {
        return new Response("NO_AUTH", { status: 401 });
    }

    // --------------------------------------
    // 🔥 Clave de caché
    // --------------------------------------
    const cacheKey = `profile:${accessToken}`;

    const cached = getCache(cacheKey);
    if (cached) {
        console.log("Serving profile from cache:", cacheKey);

        const res = new Response(JSON.stringify(cached), {
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });

        // Si el token se refrescó → enviar nuevas cookies
        if (setCookies) {
            for (const c of setCookies) {
                res.headers.append("Set-Cookie", c);
            }
        }
        return res;
    }

    // --------------------------------------
    // ❌ No hay caché → pedir a Spotify
    // --------------------------------------
    const spotifyRes = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await spotifyRes.json();

    // Guardar en caché → 24h como pediste
    setCache(cacheKey, data, 86400);

    const res = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });

    // Enviar nuevas cookies si hubo refresh
    if (setCookies) {
        for (const c of setCookies) {
            res.headers.append("Set-Cookie", c);
        }
    }

    return res;
};
