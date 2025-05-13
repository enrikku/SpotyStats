import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  const isPublicPath =
    pathname === '/' ||
    pathname === '/callback' ||
    pathname.startsWith('/api/');

  const accessToken = context.cookies.get('access_token')?.value;

  if (!accessToken && !isPublicPath) {
    return context.redirect('/');
  }

  return next();
});
