import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { imagemDoEvento } from "../utils/eventVisuals";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get("/eventos")
      .then((response) => {
        const encontrado = response.data.find((e) => e.id === id);
        if (!encontrado) throw new Error("Evento não encontrado.");
        setEvento(encontrado);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-sans text-white/50">Carregando evento...</p>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="font-sans text-red-400">{erro || "Evento não encontrado."}</p>
        <button
          onClick={() => navigate("/")}
          className="font-sans text-brand underline"
        >
          Voltar pra Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative h-72 overflow-hidden">
        <img
          src={imagemDoEvento(evento.tipo)}
          alt={evento.titulo}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="px-6 md:px-16 -mt-16 relative">
        <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide">
          {evento.titulo}
        </h1>
        <p className="font-sans text-white/60 mt-2">
          {evento.local} · R$ {evento.preco.toFixed(2)}
        </p>

      </div>
    </div>
  );
}