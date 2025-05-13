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
  return getCookie("access_token") || "";
}

export async function getAccessTokenFromCookies(cookies) {
  return cookies.get("access_token")?.value || "";
}