// src/pages/api/spotify/create-playlist.ts
export const runtime = "node";

import type { APIRoute } from "astro";
import { spotifyRequest } from "../../../utils/spotifyApi";

export const POST: APIRoute = async ({ request }) => {
    // Leer cookie
    const cookie = request.headers.get("cookie");
    const sessionId = cookie?.match(/sessionId=([^;]+)/)?.[1];

    if (!sessionId) {
        return new Response("No session", { status: 401 });
    }

    // Leer el body del JSON
    const body = await request.json();
    const name = body.name ?? "Nueva Playlist";
    const description = body.description ?? "";
    const isPublic = body.public ?? false;
    //const trackUris: string[] = body.trackUris ?? [];

    //console.log("Creating playlist with:", { name, description, isPublic, trackUris });

    // Obtener el perfil del usuario para saber su userId
    const profile = await spotifyRequest(
        sessionId,
        "https://api.spotify.com/v1/me"
    );

    if (!profile?.id) {
        return new Response("User ID not found", { status: 500 });
    }

    const userId = profile.id;

    // Crear playlist
    const createRes = await spotifyRequest(
        sessionId,
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
            method: "POST",
            body: JSON.stringify({
                name,
                description,
                public: isPublic
            })
        }
    );

    return new Response(JSON.stringify(createRes), {
        headers: { "Content-Type": "application/json" }
    });
};
