// // // src/utils/spotifyApi.ts
// // import { getSession, refreshAccessToken } from "./spotifySession";

// // export async function spotifyRequest(sessionId: string, url: string, options = {}) {
// //   let session = getSession(sessionId);

// //   if (!session) {
// //     return { error: "NO_SESSION" };
// //   }

// //   // refrescar si ha expirado
// //   if (Date.now() > session.expiresAt) {
// //     session = await refreshAccessToken(session);
// //   }

// //   const res = await fetch(url, {
// //     ...options,
// //     headers: {
// //       Authorization: `Bearer ${session.accessToken}`,
// //       "Content-Type": "application/json",
// //       ...(options.headers || {})
// //     }
// //   });
// //   if (res.status === 204) return null;

// //   const text = await res.text();

// //   // Si está vacío, no hay nada que parsear
// //   if (!text) return null;

// //   // Intentar parsear JSON; si falla devolver texto plano
// //   try {
// //     return JSON.parse(text);
// //   } catch {
// //     return text;
// //   }
// // }

// // src/utils/spotifyApi.ts
// //import { getSession, refreshAccessToken, saveSession } from "./spotifyAuth";

// export async function spotifyRequest(sessionId: string, url: string, options: any = {}) {
//   let session = getSession(sessionId);

//   if (!session) {
//     return { error: "NO_SESSION" };
//   }

//   // --- 1) REFRESCAR TOKEN SI HA EXPIRADO ---
//   if (Date.now() > session.expiresAt) {
//     const refreshed = await refreshAccessToken(session);

//     if (!refreshed) {
//       return { error: "TOKEN_REFRESH_FAILED" };
//     }

//     session = refreshed;
//     saveSession(sessionId, refreshed); // 🔥 Guarda los nuevos tokens
//   }

//   // --- 2) HACER LA PETICIÓN ---
//   let res = await fetch(url, {
//     ...options,
//     headers: {
//       Authorization: `Bearer ${session.accessToken}`,
//       "Content-Type": "application/json",
//       ...(options.headers || {})
//     }
//   });

//   // --- 3) SI TOKEN EXPIRA, REINTENTAMOS UNA VEZ ---
//   if (res.status === 401) {
//     const refreshed = await refreshAccessToken(session);

//     if (!refreshed) {
//       return { error: "TOKEN_REFRESH_FAILED" };
//     }

//     session = refreshed;
//     saveSession(sessionId, refreshed);

//     // Reintentar la misma petición
//     res = await fetch(url, {
//       ...options,
//       headers: {
//         Authorization: `Bearer ${refreshed.accessToken}`,
//         "Content-Type": "application/json",
//         ...(options.headers || {})
//       }
//     });
//   }

//   // --- 4) RESPUESTA VACÍA (ej: 204 de pausar, next, previous...) ---
//   if (res.status === 204) return null;

//   const text = await res.text();
//   if (!text) return null;

//   // --- 5) PARSEAR JSON SEGURO ---
//   try {
//     return JSON.parse(text);
//   } catch {
//     return text; // como fallback
//   }
// }
