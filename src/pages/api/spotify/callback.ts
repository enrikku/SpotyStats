// import type { APIRoute } from "astro";
// import { createSession } from "../../../utils/spotifySession";
// export const runtime = "node";

// export const GET: APIRoute = async ({ request }) => {
//   const url = new URL(request.url);
//   const code = url.searchParams.get("code");

//   console.log("Received Spotify callback with code:", code);

//   if (!code) {
//     return new Response("Error: falta el código de Spotify", { status: 400 });
//   }

//   const res = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "authorization_code",
//       code,
//       redirect_uri: import.meta.env.SPOTIFY_REDIRECT_URI,
//       client_id: import.meta.env.SPOTIFY_CLIENT_ID,
//       client_secret: import.meta.env.SPOTIFY_CLIENT_SECRET
//     })
//   });

//   const json = await res.json();

//   const sessionId = createSession({
//     accessToken: json.access_token,
//     refreshToken: json.refresh_token,
//     expiresIn: json.expires_in
//   });

//   // Guardar cookie segura y volver a la página principal
//   return new Response(null, {
//   status: 302,
//   headers: {
//     Location: "/home",
//     "Set-Cookie": `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
//   }
// });
//   // return new Response(null, {
//   //   status: 302,
//   //   headers: {
//   //     "Set-Cookie": `sessionId=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax`,
//   //     Location: "/home"
//   //   }
//   // });
// };


import type { APIRoute } from "astro";
import { createSession } from "../../../utils/spotifySession";
export const runtime = "node";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log("Received Spotify callback with code:", code);

  if (!code) {
    return new Response("Error: falta el código de Spotify", { status: 400 });
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: import.meta.env.SPOTIFY_REDIRECT_URI,
      client_id: import.meta.env.SPOTIFY_CLIENT_ID,
      client_secret: import.meta.env.SPOTIFY_CLIENT_SECRET
    })
  });

  const json = await res.json();

  const sessionId = createSession({
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in
  });

  // Guardar cookie con dominio explícito
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/home",
      "Set-Cookie": [
        `sessionId=${sessionId}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Domain=www.spotystats.es", // ← ★ IMPORTANTE ★
        "Max-Age=2592000"
      ].join("; ")
    }
  });
};
