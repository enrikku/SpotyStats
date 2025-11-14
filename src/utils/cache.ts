// src/utils/cache.ts

type CacheEntry = {
    value: any;
    expires: number;
};

const cache = new Map<string, CacheEntry>();

/**
 * Guarda un valor en caché durante X segundos
 */
export function setCache(key: string, value: any, ttlSeconds: number) {
    cache.set(key, {
        value,
        expires: Date.now() + ttlSeconds * 1000
    });
}

/**
 * Lee un valor de la caché (si sigue vigente)
 */
export function getCache(key: string) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

/**
 * Envuelve un handler API con caché automática
 */
export function cachedHandler(handler: Function, ttlSeconds: number) {
    return async (...args: any[]) => {
        const key = handler.name + JSON.stringify(args);

        const cached = getCache(key);
        if (cached) {
            return cached;
        }

        const result = await handler(...args);
        setCache(key, result, ttlSeconds);

        return result;
    };
}
