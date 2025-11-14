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
export const runtime = "node";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

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

  const accessToken = json.access_token;
  const refreshToken = json.refresh_token;
  const expiresAt = Date.now() + json.expires_in * 1000;

  const host = request.headers.get("host") || "";
  const isProd = host.includes("spotystats.es");
  const cookieDomain = isProd ? "Domain=www.spotystats.es;" : "";
  const flags = `Path=/; HttpOnly; Secure; SameSite=Lax; ${cookieDomain} Max-Age=2592000`;

  // Creamos la respuesta vacía
  const response = new Response(null, {
    status: 302,
    headers: { Location: "/home" }
  });

  // Añadimos cookies UNA A UNA
  response.headers.append("Set-Cookie", `accessToken=${accessToken}; ${flags}`);
  response.headers.append("Set-Cookie", `refreshToken=${refreshToken}; ${flags}`);
  response.headers.append("Set-Cookie", `expiresAt=${expiresAt}; ${flags}`);

  return response;
};
