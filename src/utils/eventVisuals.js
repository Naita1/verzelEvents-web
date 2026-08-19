const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";

export async function buscarCapaTMDB(titulo) {
  if (!TMDB_KEY || !titulo) return FALLBACK_IMAGE;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
        titulo
      )}&language=pt-BR`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `${TMDB_IMAGE_BASE}${data.results[0].poster_path}`;
    }
  } catch (error) {
    console.error("Erro ao buscar imagem no TMDB:", error);
  }

  return FALLBACK_IMAGE;
}

const CORES_POR_TIPO = {
  SHOW: "bg-brand/90",
  FILME: "bg-accent/90",
  CINEMA: "bg-accent/90",
  TEATRO: "bg-emerald-500/90",
};

export function corBadgeDoEvento(tipo) {
  const tipoNormalized = tipo?.toUpperCase();
  return CORES_POR_TIPO[tipoNormalized] || "bg-white/20";
}