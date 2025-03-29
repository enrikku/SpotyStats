import { decrypt } from "./crypto";

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export function setCookie(name, value, expiresInSeconds = 3600) {
  const date = new Date(Date.now() + expiresInSeconds * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

export async function getAccesTokenCookie() {
  const cookie = getCookie("access_token") || "";
  const encryptedToken = JSON.parse(decodeURIComponent(cookie));

  const token = await decrypt(
    encryptedToken,
    import.meta.env.PUBLIC_CRYPT_PSSWD
  );

  return token;
}

export async function getAccessTokenFromCookies(cookies, secret) {
  const cookie = cookies.get("access_token")?.value || "";
  const encryptedToken = JSON.parse(decodeURIComponent(cookie));

  const token = await decrypt(encryptedToken, secret);
  return token;
}