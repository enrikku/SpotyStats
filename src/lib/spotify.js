export async function getTopTracks(access_token, time_range = "medium_term") {
    const res = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${time_range}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  
    if (!res.ok) {
      throw new Error("❌ Error al obtener top tracks: " + res.status);
    }
  
    const data = await res.json();
    return data.items; // contiene las canciones
  }
  