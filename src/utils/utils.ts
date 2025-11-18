import type { ResultTopp100Artist } from "../interfaces/ResultTopp100Artist";
import type { SpotifyExtendedStreamingHistory } from "../interfaces/SpotifyExtendedStreamingHistory";

export function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split("; ").reduce(
    (acc, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  return cookies[cookieName] || null;
}

export function saveCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/;Secure;SameSite=Lax";
}

export function deleteCookie(name: string) {
  document.cookie = name + "=; Max-Age=0; path=/;Secure;SameSite=Lax";
}

export function getTop100Artists(data: SpotifyExtendedStreamingHistory[]) {
  const artistsMap = new Map();

  for (const record of data) {
    const artist = record.master_metadata_album_artist_name;
    const ms = record.ms_played || 0;

    if (!artist) continue; // ignorar registros sin artista

    if (!artistsMap.has(artist)) {
      artistsMap.set(artist, {
        artist,
        totalMs: 0,
        plays: 0,
        idTrack: record.spotify_track_uri,
      });
    }

    const entry = artistsMap.get(artist);
    entry.totalMs += ms;
    entry.plays += 1;
  }

  const result: ResultTopp100Artist[] = [...artistsMap.values()]
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, 100)
    .map((item) => ({
      artist: item.artist,
      minutes: Math.floor(item.totalMs / 60000),
      plays: item.plays,
      idTrack: item.idTrack,
    }));

  // Guardar resultado en caché
  localStorage.setItem("top100ArtistsCache", JSON.stringify(result));
  console.log("Top 100 artists cached.");
  return result;
}
