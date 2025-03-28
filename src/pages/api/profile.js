import { Buffer } from "buffer";

const CLIENT_ID = import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.PUBLIC_SPOTIFY_CLIENT_SECRET_ID;
const REDIRECT_URI = import.meta.env.PUBLIC_REDIRECTED_URI;

/** @type {import('astro').APIRoute} */
export async function GET({ params, request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(JSON.stringify({ error: "No token provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: "Error al obtener perfil" }),
        {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify(await result.json()));
  }

  //   const code = url.searchParams.get("code");

  //   console.log("Params:", params);
  //   console.log("🧩 request.url:", request.url);
  //   console.log("🟢 code en API:", code);

  //   if (!code) {
  //     return new Response(JSON.stringify({ error: "No code provided" }), {
  //       status: 400,
  //       headers: { "Content-Type": "application/json" },
  //     });
  //   }

  //   const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  //   const body = new URLSearchParams({
  //     grant_type: "authorization_code",
  //     code,
  //     redirect_uri: REDIRECT_URI,
  //   });

  //   try {
  //     const response = await fetch("https://accounts.spotify.com/api/token", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Basic ${credentials}`,
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //       body,
  //     });

  //     const data = await response.json();

  //     if (response.status !== 200) {
  //       console.error("Spotify error:", data);
  //     }

  //     return new Response(JSON.stringify(data), {
  //       status: response.status,
  //       headers: { "Content-Type": "application/json" },
  //     });
  //   } catch (err) {
  //     return new Response(JSON.stringify({ error: "Internal server error" }), {
  //       status: 500,
  //       headers: { "Content-Type": "application/json" },
  //     });
  //   }
}
