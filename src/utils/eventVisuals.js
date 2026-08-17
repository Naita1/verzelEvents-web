const IMAGENS_POR_TIPO = {
  SHOW: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
  CINEMA: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
  TEATRO: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
};

const FALLBACK = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800";

export function imagemDoEvento(tipo) {
  return IMAGENS_POR_TIPO[tipo] || FALLBACK;
}

const CORES_POR_TIPO = {
  SHOW: "bg-brand/90",
  FILME: "bg-accent/90",
  TEATRO: "bg-emerald-500/90",
};

export function corBadgeDoEvento(tipo) {
  const tipoNormalized = tipo?.toUpperCase();
  return CORES_POR_TIPO[tipoNormalized] || "bg-white/20";
}