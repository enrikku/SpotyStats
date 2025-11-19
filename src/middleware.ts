export function onRequest(context: any, next: any) {
  const cookie = context.cookies.get("accessToken")?.value;

  if (context.url.pathname === "/") {
    if (cookie) {
      const redirectUrl = new URL("/home", context.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }
  }

  return next();
}
