
import type { SpotifyExtendedStreamingHistory } from "../interfaces/SpotifyExtendedStreamingHistory.ts";

export function getMinutesPerDay(artistData: SpotifyExtendedStreamingHistory[]) {
    const map = new Map();

    for (const r of artistData) {
        const day = r.ts.split("T")[0]; // yyyy-mm-dd
        const minutes = (r.ms_played || 0) / 60000;

        map.set(day, (map.get(day) || 0) + minutes);
    }

    // Convertimos a array ordenado por fecha
    return [...map.entries()]
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function getPlaysPerDay(artistData: SpotifyExtendedStreamingHistory[]) {
    const map = new Map();

    for (const r of artistData) {
        const day = r.ts.split("T")[0];
        map.set(day, (map.get(day) || 0) + 1);
    }

    return [...map.entries()].map(([date, plays]) => ({ date, plays })).sort((a, b) => a.date.localeCompare(b.date));
}

export function getTotalMinutes(artistData: SpotifyExtendedStreamingHistory[]) {
    return Math.floor(artistData.reduce((acc, r) => acc + (r.ms_played || 0), 0) / 60000);
}

export function getTopTracks(artistData: SpotifyExtendedStreamingHistory[]) {
    const map = new Map();

    for (const r of artistData) {
        const track = r.master_metadata_track_name;
        if (!track) continue;

        const ms = r.ms_played || 0;

        if (!map.has(track)) map.set(track, { track, minutes: 0, plays: 0 });

        const item = map.get(track);
        item.minutes += ms / 60000;
        item.plays++;
    }

    return [...map.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 20);
}

export function getMinutesPerYear(artistData: SpotifyExtendedStreamingHistory[]) {
    const map = new Map();

    for (const r of artistData) {
        const year = new Date(r.ts).getFullYear();
        const minutes = (r.ms_played || 0) / 60000;

        map.set(year, (map.get(year) || 0) + minutes);
    }

    return [...map.entries()].map(([year, minutes]) => ({ year, minutes })).sort((a, b) => a.year - b.year);
}