let _db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  // Si la DB ya está abierta, devolverla
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    // Evitar ejecutar esto en Astro SSR
    if (typeof indexedDB === "undefined") {
      reject("IndexedDB no está disponible (SSR o navegador incompatible)");
      return;
    }

    const request = indexedDB.open("spotifyStatsDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("jsonStore")) {
        db.createObjectStore("jsonStore");
      }
    };

    request.onsuccess = () => {
      _db = request.result;
      resolve(_db);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveJson(key: string, data: any): Promise<boolean> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("jsonStore", "readwrite");
    const store = tx.objectStore("jsonStore");

    store.put(data, key);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadJson<T = any>(key: string): Promise<T | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("jsonStore", "readonly");
    const store = tx.objectStore("jsonStore");

    const req = store.get(key);

    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteJson(key: string): Promise<boolean> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("jsonStore", "readwrite");
    const store = tx.objectStore("jsonStore");

    store.delete(key);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listKeys(): Promise<string[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("jsonStore", "readonly");
    const store = tx.objectStore("jsonStore");

    const req = store.getAllKeys();

    req.onsuccess = () => resolve(req.result as string[]);
    req.onerror = () => reject(req.error);
  });
}
