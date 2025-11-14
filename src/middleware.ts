// // import { defineMiddleware } from 'astro:middleware';

// // export const onRequest = defineMiddleware(async (context, next) => {
// //   const pathname = context.url.pathname;

// //   const isPublicPath =
// //     pathname === '/' ||
// //     pathname === '/callback' ||
// //     pathname.startsWith('/api/');

// //   const accessToken = context.cookies.get('access_token')?.value;

// //   if (!accessToken && !isPublicPath) {
// //     return context.redirect('/');
// //   }

// //   return next();
// // });

// import type { MiddlewareHandler } from "astro";
// import { getSession } from "./utils/spotifySession";

// export const onRequest: MiddlewareHandler = async (context, next) => {
//   const { request, cookies, url } = context;

//   // Rutas públicas (SIEMPRE accesibles)
//   const publicPaths = [
//     "/login/spotify",
//     "/api/spotify/callback"
//   ];

//   if (publicPaths.some((p) => url.pathname.startsWith(p))) {
//     return next();
//   }

//   // Leer sessionId de cookie
//   const sessionId = cookies.get("sessionId")?.value;

//   // No hay cookie → usuario no autenticado
//   if (!sessionId) {
//     return context.redirect("/login/spotify");
//   }

//   const session = getSession(sessionId);

//   // Sesión perdida (server reiniciado)
//   if (!session) {
//     // Borrar cookie inválida
//     cookies.delete("sessionId", { path: "/" });
//     return context.redirect("/login/spotify");
//   }

//   // Hacemos la sesión accesible en endpoints o loaders
//   context.locals.session = session;

//   return next();
// };
