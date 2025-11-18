// src/pages/login/spotify.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  console.log("Initiating Spotify OAuth2 authorization flow");

  const params = new URLSearchParams({
    client_id: import.meta.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: import.meta.env.SPOTIFY_REDIRECT_URI,
    scope:
      "user-read-currently-playing user-read-private user-read-email user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-modify user-library-read user-read-playback-state user-modify-playback-state playlist-modify-private playlist-modify-public",
  });

  console.log("Redirecting to Spotify authorization URL");

  return Response.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
};
