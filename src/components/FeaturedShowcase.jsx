import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePosterEvento } from "../utils/usePosterEvento";

const slideVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

const AUTOPLAY_MS = 7000;

export default function FeaturedShowcase({ eventos, loading }) {
  const [indice, setIndice] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const temEventos = !loading && eventos && eventos.length > 0;
  const currentEvent = temEventos ? eventos[indice % eventos.length] : null;

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(currentEvent);

  const proximo = useCallback(() => {
    setDirection(1);
    setIndice((i) => (i + 1) % eventos.length);
  }, [eventos.length]);

  function anterior() {
    setDirection(-1);
    setIndice((i) => (i - 1 + eventos.length) % eventos.length);
  }

  function irPara(novoIndice) {
    setDirection(novoIndice > indice ? 1 : -1);
    setIndice(novoIndice);
  }

  useEffect(() => {
    if (!temEventos || eventos.length <= 1 || isPaused) return;
    const timer = setInterval(proximo, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [temEventos, eventos.length, isPaused, proximo]);

  let dataFormatada = "";
  let horaFormatada = "";
  if (currentEvent?.dataHora) {
    const data = new Date(currentEvent.dataHora);
    dataFormatada = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function handleKeyDown(e) {
    if (!temEventos || eventos.length <= 1) return;
    if (e.key === "ArrowRight") proximo();
    if (e.key === "ArrowLeft") anterior();
  }

  return (
    <div className="relative max-w-5xl mx-auto px-6 -mt-6 z-20 overflow-visible">
      <div
        role="region"
        aria-label="Destaques em cartaz"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="relative w-full bg-[#2d0a14] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-h-90 p-6 sm:p-8 md:p-10 md:px-14 outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
      >
        {temEventos && eventos.length > 1 && (
          <>
            <button
              onClick={anterior}
              aria-label="Evento anterior"
              className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full bg-bg/90 md:bg-bg border border-white/10 backdrop-blur flex items-center justify-center text-white/80 font-bold text-lg hover:text-white hover:border-brand/50 transition-all duration-200 active:scale-90 shadow-lg"
            >
              ‹
            </button>
            <button
              onClick={proximo}
              aria-label="Próximo evento"
              className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full bg-bg/90 md:bg-bg border border-white/10 backdrop-blur flex items-center justify-center text-white/80 font-bold text-lg hover:text-white hover:border-brand/50 transition-all duration-200 active:scale-90 shadow-lg"
            >
              ›
            </button>
          </>
        )}

        {!temEventos && (
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-12 min-h-80 animate-pulse">
            <div className="flex-1 w-full space-y-4 py-1">
              <div className="h-3 w-20 bg-white/10 rounded-full" />
              <div className="h-9 md:h-11 w-3/4 bg-white/10 rounded-lg" />
              <div className="h-3.5 w-1/2 bg-white/10 rounded-full" />
              <div className="h-3.5 w-40 bg-white/10 rounded-full" />
              <div className="h-10 w-36 bg-white/10 rounded-full mt-6" />
            </div>
            <div className="shrink-0">
              <div className="w-37.5 sm:w-45 md:w-52.5 aspect-2/3 rounded-2xl bg-white/10" />
            </div>
          </div>
        )}

        {temEventos && (
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentEvent.id || indice}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 lg:gap-12 min-h-80 transform-gpu"
              >
                <div className="flex-1 flex flex-col justify-center my-auto py-1 min-w-0">
                  <div>
                    <span className="font-sans text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                      {currentEvent.tipo || "Cinema"}
                    </span>

                    <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-[1.05] mb-4 line-clamp-2">
                      {currentEvent.titulo || "Evento sem título"}
                    </h2>

                    <p className="font-sans text-sm text-white/70 mb-3 truncate">
                      {currentEvent.local || "Local a confirmar"}
                    </p>

                    <div className="flex items-center gap-3 font-sans text-sm text-white/90 mb-6">
                      <span>{dataFormatada || "Data a definir"}</span>
                      <span className="text-brand/70">•</span>
                      <span>{horaFormatada || "--:--"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <button
                      onClick={() => navigate(`/eventos/${currentEvent.id}`)}
                      className="font-sans font-semibold text-xs uppercase tracking-wider bg-gray-200 hover:bg-brand text-black hover:text-white rounded-full px-8 py-3 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg hover:shadow-brand/25"
                    >
                      Comprar
                    </button>

                   Z
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center my-auto">
                  <div className="relative w-37.5 sm:w-45 md:w-52.5 aspect-2/3 overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl group ring-1 ring-white/10">
                    {imgLoading && (
                      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-zinc-800 to-zinc-900" />
                    )}

                    {!imgLoading && imageUrl && (
                      <img
                        src={imageUrl}
                        alt={currentEvent?.titulo || "Pôster do evento"}
                        onLoad={marcarPronto}
                        onError={marcarErro}
                        className={`w-full h-full object-cover object-center rounded-2xl transform-gpu transition-all duration-500 ease-out group-hover:scale-105 ${
                          imgReady ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}

                    {!imgLoading && !imageUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 p-4">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M3 9h18M8 4v5M16 4v5" />
                        </svg>
                        <span className="font-sans text-xs text-center leading-snug">
                          Pôster indisponível
                        </span>
                      </div>
                    )}

                    <span className="absolute left-1/2 -top-4 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2d0a14] z-10 pointer-events-none" />
                    <span className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-8 h-8 rounded-full bg-[#2d0a14] z-10 pointer-events-none" />

                    <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-brand/30 transition-all duration-300 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {temEventos && eventos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            {eventos.map((_, i) => (
              <button
                key={i}
                onClick={() => irPara(i)}
                aria-label={`Ir para destaque ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === indice ? "w-6 bg-brand" : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}