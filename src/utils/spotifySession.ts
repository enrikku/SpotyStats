// src/utils/spotifySession.ts

// Aquí guardamos temporalmente las sesiones.
// Puedes remplazarlo por Supabase o una DB.
let sessions = {} as Record<string, {
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}>;

export function createSession({ accessToken, refreshToken, expiresIn }: { accessToken: string; refreshToken: string; expiresIn: number }) {
    const sessionId = crypto.randomUUID();

    sessions[sessionId] = {
        sessionId,
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000
    };

    return sessionId;
}

export function getSession(sessionId: string) {
    return sessions[sessionId];
}

export function saveSession(session: { sessionId: string; accessToken: string; refreshToken: string; expiresAt: number }) {
    sessions[session.sessionId] = session;
}

export async function refreshAccessToken(session: { sessionId: string; accessToken: string; refreshToken: string; expiresAt: number }) {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: session.refreshToken,
            client_id: import.meta.env.SPOTIFY_CLIENT_ID,
            client_secret: import.meta.env.SPOTIFY_CLIENT_SECRET
        })
    });

    const json = await res.json();

    const newSession = {
        ...session,
        accessToken: json.access_token,
        expiresAt: Date.now() + json.expires_in * 1000
    };

    saveSession(newSession);
    return newSession;
}
