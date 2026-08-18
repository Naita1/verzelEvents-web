import { useState, useEffect } from "react";

function sanitizeTitle(rawTitle) {
  if (!rawTitle) return "";
  return rawTitle
    .split(/[-–—:(]/)[0]
    .replace(/\b(dublado|legendado|3d|2d|4k|imax|relançamento)\b/gi, "")
    .trim();
}

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

export function usePosterEvento(evento) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setImageUrl(null);
    setImgReady(false);

    async function buscarPoster() {
      if (evento?.imagemUrl) {
        if (!cancelled) {
          setImageUrl(evento.imagemUrl);
          setImgLoading(false);
        }
        return;
      }

      if (!evento?.titulo) {
        if (!cancelled) setImgLoading(false);
        return;
      }

      setImgLoading(true);
      const cleanTitle = sanitizeTitle(evento.titulo);
      const query = encodeURIComponent(cleanTitle);

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}&language=pt-BR`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const movie = data.results?.[0];
        const filePath = movie?.poster_path || movie?.backdrop_path;

        if (filePath) {
          if (!cancelled) setImageUrl(`https://image.tmdb.org/t/p/w780${filePath}`);
          return;
        }
        throw new Error("Sem resultado no TMDB");
      } catch {
        try {
          const r = await fetch(`https://www.omdbapi.com/?t=${query}&apikey=trilogy`);
          const omdb = await r.json();
          if (!cancelled) {
            setImageUrl(omdb.Poster && omdb.Poster !== "N/A" ? omdb.Poster : null);
          }
        } catch {
          if (!cancelled) setImageUrl(null);
        }
      } finally {
        if (!cancelled) setImgLoading(false);
      }
    }

    buscarPoster();
    return () => {
      cancelled = true;
    };
  }, [evento?.imagemUrl, evento?.titulo]);

  return {
    imageUrl,
    imgLoading,
    imgReady,
    marcarPronto: () => setImgReady(true),
    marcarErro: () => setImageUrl(null),
  };
}