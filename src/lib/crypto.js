export function strToBuf(str) {
  return new TextEncoder().encode(str);
}

export function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function b64ToBuf(b64) {
  return new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
}

export async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    strToBuf(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(text, password) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    strToBuf(text)
  );

  return {
    ciphertext: bufToB64(ciphertext),
    iv: bufToB64(iv),
    salt: bufToB64(salt),
  };
}

export async function decrypt({ ciphertext, iv, salt }, password) {
  try{
    const key = await deriveKey(password, b64ToBuf(salt));
    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: b64ToBuf(iv) },
      key,
      b64ToBuf(ciphertext)
    );

    return new TextDecoder().decode(plainBuffer);
  }
  catch(e){
    console.log(e);
  }

}
