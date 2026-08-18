import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const getImageUrl = (url) =>
  url?.startsWith("/")
    ? `https://image.tmdb.org/t/p/w780${url}`
    : url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000";

export default function FeaturedShowcase({ eventos, loading }) {
  const [indice, setIndice] = useState(0);
  const navigate = useNavigate();

  function proximo() {
    setIndice((i) => (i + 1) % eventos.length);
  }
  function anterior() {
    setIndice((i) => (i - 1 + eventos.length) % eventos.length);
  }

  const temEventos = !loading && eventos.length > 0;
  const evento = temEventos ? eventos[indice % eventos.length] : null;

  let dataFormatada = "";
  let horaFormatada = "";
  if (evento?.dataHora) {
    const data = new Date(evento.dataHora);
    dataFormatada = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="relative max-w-5xl mx-auto px-6 -mt-6 z-20 overflow-visible">

      <div className="relative w-full bg-[#2d0a14] border border-white/10 rounded-2xl shadow-2xl min-h-[320px] p-6 md:p-8">
        
        {temEventos && eventos.length > 1 && (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0e12] flex items-center justify-center z-30">
            <button
              onClick={anterior}
              aria-label="Evento anterior"
              className="w-8 h-8 rounded-full bg-[#d1d5db] hover:bg-white text-[#2a0812] font-bold text-lg flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              ‹
            </button>
          </div>
        )}

        {temEventos && eventos.length > 1 && (
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0e12] flex items-center justify-center z-30">
            <button
              onClick={proximo}
              aria-label="Próximo evento"
              className="w-8 h-8 rounded-full bg-[#d1d5db] hover:bg-white text-[#2a0812] font-bold text-lg flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              ›
            </button>
          </div>
        )}

        {!temEventos && (
          <div className="p-8 text-center text-white/50 font-sans">
            Carregando destaques...
          </div>
        )}

        {temEventos && (
          <AnimatePresence mode="wait">
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 min-h-[320px] transform-gpu"
            >
              <div className="flex flex-col justify-between h-full pt-1">
                <div>
                  <span className="font-sans text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2">
                    {evento.tipo || "Cinema"}
                  </span>

                  <h2 className="font-display text-3xl md:text-5xl text-white uppercase tracking-wide leading-tight mb-5">
                    {evento.titulo}
                  </h2>

                  <p className="font-sans text-sm text-white/80 mb-3">
                    {evento.local}
                  </p>

                  <div className="flex items-center gap-8 font-sans text-sm text-white/80 mb-6">
                    <div>
                      <span className="block text-white/90">{dataFormatada || "Data"}</span>
                    </div>
                    <div>
                      <span className="block text-white/90">{horaFormatada || "Hora"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 pt-2">
                  <button
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                    className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#d1d5db] hover:bg-white text-[#2a0812] rounded-full px-8 py-3 transition-all duration-200 active:scale-95 shadow-md"
                  >
                    Comprar
                  </button>
                </div>
              </div>

              <div className="relative h-full min-h-[240px] flex items-center justify-center">
                <div className="relative w-full h-full min-h-[240px] rounded-2xl overflow-hidden group">
                  <img
                    src={getImageUrl(evento.imagemUrl)}
                    alt={evento.titulo}
                    className="w-full h-full object-cover rounded-2xl transform-gpu transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2d0a14]" />

                  <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2d0a14]" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}