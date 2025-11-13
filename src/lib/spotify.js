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

export async function getTopArtists(access_token, time_range = "medium_term") {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${time_range}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("❌ Error al obtener top artists: " + res.status);
  }

  const data = await res.json();
  return data.items; // contiene los artistas
}

export async function getTopGenres(access_token, time_range = "medium_term") {
  const artists = await getTopArtists(access_token, time_range);

  // Obtener todos los géneros y contar ocurrencias
  const genreCounts = artists.reduce((acc, artist) => {
    artist.genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  // Calcular el total de apariciones de géneros
  const totalGenres = Object.values(genreCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Convertir a array, calcular porcentajes y ordenar
  const sortedGenres = Object.entries(genreCounts)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalGenres) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return sortedGenres;
}

export async function createPlaylist(access_token, tracks, time_range) {
  // Primero obtenemos el ID del usuario
  const userResponse = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error(
      "❌ Error al obtener información del usuario: " + userResponse.status
    );
  }

  const userData = await userResponse.json();
  const userId = userData.id;

  // Crear la playlist

  const date = new Date();
  const timestamp = date.getTime(); // milisegundos desde 1970
  const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-"); // ej: "12-05-2025"

  const playlistName = `Top Tracks ${time_range} - ${formattedDate}-${timestamp}`;

  const playlistResponse = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        description: `Tus canciones más escuchadas en ${time_range} - ${Date.now()}`,
        public: false,
      }),
    }
  );

  if (!playlistResponse.ok) {
    throw new Error(
      "❌ Error al crear la playlist: " + playlistResponse.status
    );
  }

  const playlistData = await playlistResponse.json();
  const playlistId = playlistData.id;

  // Añadir las canciones a la playlist
  const trackUris = tracks.map((track) => track.uri);
  const addTracksResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );

  if (!addTracksResponse.ok) {
    throw new Error(
      "❌ Error al añadir canciones a la playlist: " + addTracksResponse.status
    );
  }

  return playlistData;
}

export async function getAudioFeatures(access_token, track_id) {
  const res = await fetch(
    `https://api.spotify.com/v1/audio-features/${track_id}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      "❌ Error al obtener las características de audio: " + res.status
    );
    console.log(res);
  }

  const data = await res.json();
  return data; // ✅ Esto es el objeto con valence, energy, tempo, etc.
}

export async function getSong(access_token, track_id) {
  const res = await fetch(`https://api.spotify.com/v1/tracks/${track_id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (!res.ok) {
    throw new Error("❌ Error al obtener la canción: " + res.status);
  }

  const data = await res.json();
  return data;
}

export async function getArtist(access_token, artist_id) {
  const res = await fetch(`https://api.spotify.com/v1/artists/${artist_id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (!res.ok) {
    throw new Error("❌ Error al obtener la canción: " + res.status);
  }

  const data = await res.json();
  return data;
}
