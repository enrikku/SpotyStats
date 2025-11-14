// src/utils/spotifyAuth.ts
export async function getValidSpotifyToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";

  const accessToken = cookie.match(/accessToken=([^;]+)/)?.[1];
  const refreshToken = cookie.match(/refreshToken=([^;]+)/)?.[1];
  const expiresAt = Number(cookie.match(/expiresAt=([^;]+)/)?.[1]);

  if (!accessToken || !refreshToken || !expiresAt) {
    return { error: "NO_AUTH" };
  }

  // NO EXPIRADO → devolver token directamente
  if (Date.now() < expiresAt) {
    return { accessToken, setCookies: [] };
  }

  // EXPIRO → refrescar token
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: import.meta.env.SPOTIFY_CLIENT_ID,
      client_secret: import.meta.env.SPOTIFY_CLIENT_SECRET
    })
  });

  const json = await res.json();

  if (!json.access_token) {
    return { error: "REFRESH_FAILED" };
  }

  const newAccessToken = json.access_token;
  const newExpiresAt = Date.now() + json.expires_in * 1000;

  const baseFlags = `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;

  const setCookies = [
    `accessToken=${newAccessToken}; ${baseFlags}`,
    `expiresAt=${newExpiresAt}; ${baseFlags}`
  ];

  return { accessToken: newAccessToken, setCookies };
}
