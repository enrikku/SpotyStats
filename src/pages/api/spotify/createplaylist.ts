// src/pages/api/spotify/create-playlist.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { getValidSpotifyToken } from "../../../utils/spotifyAuth";

export const POST: APIRoute = async ({ request }) => {
    // Obtener token válido (refresh si caducó)
    const { accessToken, setCookies, error } = await getValidSpotifyToken(request);

    if (error) {
        return new Response("NO_AUTH", { status: 401 });
    }

    // Leer body
    const body = await request.json();
    const name = body.name ?? "Nueva Playlist";
    const description = body.description ?? "";
    const isPublic = body.public ?? false;

    // 1️⃣ Obtener perfil para userId
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await profileRes.json();

    if (!profile?.id) {
        return new Response("User ID not found", { status: 500 });
    }

    // 2️⃣ Crear playlist
    const createRes = await fetch(
        `https://api.spotify.com/v1/users/${profile.id}/playlists`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                description,
                public: isPublic
            })
        }
    );

    const created = await createRes.json();

    // 3️⃣ Preparar respuesta + cookies (si hay refresh)
    const response = new Response(JSON.stringify(created), {
        headers: { "Content-Type": "application/json" }
    });

    if (setCookies) {
        for (const c of setCookies) {
            response.headers.append("Set-Cookie", c);
        }
    }

    return response;
};
