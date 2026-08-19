import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { listarAssentos, reservarAssento } from "../services/seatService";
import { usePosterEvento } from "../utils/usePosterEvento";

import bgImage from "../assets/background3.jpg";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [assentos, setAssentos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const [resultadoParcial, setResultadoParcial] = useState(null);

  const { imageUrl, imgLoading, imgReady, marcarPronto, marcarErro } =
    usePosterEvento(evento);

  useEffect(() => {
    Promise.all([
      api.get(`/eventos/${id}`),
      listarAssentos(id),
    ])
      .then(([eventoRes, assentosData]) => {
        setEvento(eventoRes.data);
        setAssentos(assentosData);
      })
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const limiteLiberado = evento?.quantidadeIngressos || evento?.capacidade || assentos.length;
  
  const assentosOcupados = assentos.filter(
    (a) => a.status === "RESERVADO" || a.status === "VENDIDO" || a.status === "OCUPADO"
  ).length;

  const vagasDisponiveisNoEvento = Math.max(0, limiteLiberado - assentosOcupados);

  function toggleAssento(assento) {
    const isOcupado = assento.status === "OCUPADO" || assento.status === "RESERVADO" || assento.status === "VENDIDO";
    if (isOcupado) return;

    const jaSelecionado = selecionados.includes(assento.id);

    if (!jaSelecionado && selecionados.length >= vagasDisponiveisNoEvento) {
      return;
    }

    setSelecionados((prev) =>
      jaSelecionado
        ? prev.filter((aId) => aId !== assento.id)
        : [...prev, assento.id]
    );
  }

  const precoUnitario = Number(evento?.preco || evento?.valorIngresso || evento?.valor || 0);
  const valorTotal = selecionados.length * precoUnitario;

  async function confirmarReserva() {
    setConfirmando(true);
    setResultadoParcial(null);

    const resultados = await Promise.allSettled(
      selecionados.map((assentoId) => reservarAssento(id, assentoId))
    );

    const sucesso = [];
    const falha = [];

    resultados.forEach((resultado, index) => {
      const assentoId = selecionados[index];
      const codigo = assentos.find((a) => a.id === assentoId)?.codigo;

      if (resultado.status === "fulfilled") {
        sucesso.push({ assentoId, codigo, reserva: resultado.value });
      } else {
        falha.push({ assentoId, codigo, erro: resultado.reason?.message });
      }
    });

    setConfirmando(false);
    setResultadoParcial({ sucesso, falha });

    setSelecionados(sucesso.map((s) => s.assentoId));

    setAssentos((prev) =>
      prev.map((a) =>
        sucesso.some((s) => s.assentoId === a.id)
          ? { ...a, status: "RESERVADO" }
          : a
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0b0e] flex items-center justify-center pt-32">
        <p className="font-sans text-white/50 text-xs tracking-widest uppercase">Carregando evento...</p>
      </div>
    );
  }

  if (erro || !evento) {
    return (
      <div className="min-h-screen bg-[#0d0b0e] flex flex-col items-center justify-center gap-4 px-6 pt-32 text-center">
        <p className="font-sans text-red-400 font-medium">{erro || "Evento não encontrado."}</p>
        <button
          onClick={() => navigate("/")}
          className="font-sans font-semibold text-xs uppercase tracking-wider bg-[#a11b3e] text-white rounded-full px-6 py-3 transition-colors"
        >
          Voltar para a Home
        </button>
      </div>
    );
  }

  const fileiras = ["A", "B", "C", "D", "E"];
  let globalSeatCounter = 0;

  return (
    <div className="relative min-h-screen text-white pt-28 pb-32 px-4 md:px-8 lg:px-12 font-sans overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={bgImage}
          alt="Background Eventos"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a050b]/85 via-[#0f0407]/90 to-[#0d0b0e]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
    
        <div className="lg:col-span-4 bg-[#2a0e16]/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-6 bg-[#18080c] border border-white/10 flex items-center justify-center">
              {imgLoading && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900" />
              )}

              {!imgLoading && imageUrl && (
                <img
                  src={imageUrl}
                  alt={evento.titulo}
                  onLoad={marcarPronto}
                  onError={marcarErro}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imgReady ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {!imgLoading && !imageUrl && (
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-[#a11b3e]/20 border border-[#a11b3e] flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-[#a11b3e]">
                      {evento.titulo ? evento.titulo.charAt(0).toUpperCase() : "E"}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Pôster Indisponível</p>
                </div>
              )}

              <span className="absolute top-4 left-4 bg-[#a11b3e] text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md z-10">
                {evento.tipo || "CINEMA"}
              </span>
            </div>

            <h1 className="font-display text-2xl uppercase tracking-wider text-white font-bold mb-4">
              {evento.titulo}
            </h1>
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-white/70 space-y-3">
            <p><strong className="text-white">Local:</strong> {evento.local}</p>
            <p><strong className="text-white">Ingresso:</strong> R$ {precoUnitario.toFixed(2)}</p>
          </div>
        </div>

    
        <div className="lg:col-span-8 bg-[#2a0e16]/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-white/40 pb-6 border-b border-white/10">
              <span>01 Escolha o Filme</span>
              <span className="text-[#a11b3e] border-b-2 border-[#a11b3e] pb-1">02 Escolha os Assentos</span>
              <span>03 Pagamento</span>
              <span>04 Concluído</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-white/10">
              <h1 className="font-display text-3xl md:text-4xl text-white tracking-wide font-bold">
                {evento.titulo}
              </h1>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-white/80">
                  {evento.duracao || "106"} minutos
                </span>
                <span className="bg-[#a11b3e] text-white font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wider uppercase">
                  {evento.classificacao || "PG-13"}
                </span>
              </div>
            </div>
            <div className="py-6 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-white/40 uppercase text-[10px] tracking-wider block mb-3 font-semibold">
                  Quinta-feira, 4 de Maio
                </span>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {["SEG 1", "TER 2", "QUA 3", "QUI 4", "SEX 5", "SÁB 6"].map((dia, idx) => (
                    <button
                      key={dia}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        idx === 3 ? "bg-[#a11b3e]" : "bg-black/40 text-white/60 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-white/40 uppercase text-[10px] tracking-wider block mb-3 font-semibold">
                  Horário da Sessão
                </span>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {["10:00", "12:30", "15:00", "17:30", "20:00", "22:30"].map((hora, idx) => (
                    <button
                      key={hora}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                        idx === 4 ? "bg-[#a11b3e]" : "bg-black/40 text-white/60 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 mb-6 flex flex-col items-center">
              <div className="w-full max-w-xl h-2 border-t-2 border-[#a11b3e] rounded-t-[100%] shadow-[0_-6px_12px_rgba(161,27,62,0.5)]" />
              <span className="text-[9px] tracking-[0.4em] text-white/40 uppercase mt-2 font-semibold">
                T E L A
              </span>
            </div>
            <div className="py-4 space-y-2.5 overflow-x-auto">
              {fileiras.map((rowLabel) => (
                <div key={rowLabel} className="flex items-center justify-center gap-4 text-[10px] text-white/40">
                  <span className="w-4 text-center font-bold">{rowLabel}</span>
                  <div className="flex gap-1.5">
                    {[1, 2].map(() => {
                      const index = globalSeatCounter++;
                      const assento = assentos[index] || { id: `mock-${index}`, codigo: `${rowLabel}${index}`, status: "LIVRE" };
                      const isSelecionado = selecionados.includes(assento.id);
                      const isOcupado = assento.status === "OCUPADO" || assento.status === "RESERVADO" || assento.status === "VENDIDO";
                      const atingiuLimite = !isSelecionado && selecionados.length >= vagasDisponiveisNoEvento;

                      return (
                        <button
                          key={assento.id}
                          onClick={() => toggleAssento(assento)}
                          disabled={isOcupado || atingiuLimite}
                          className={`w-5 h-5 rounded-xs transition-colors ${
                            isSelecionado
                              ? "bg-[#a11b3e]"
                              : isOcupado
                              ? "bg-red-950/80 border border-red-800/40 text-red-500/50"
                              : atingiuLimite
                              ? "bg-white/5 cursor-not-allowed opacity-30"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5 mx-2">
                    {[1, 2, 3, 4, 5, 6].map(() => {
                      const index = globalSeatCounter++;
                      const assento = assentos[index] || { id: `mock-${index}`, codigo: `${rowLabel}${index}`, status: "LIVRE" };
                      const isSelecionado = selecionados.includes(assento.id);
                      const isOcupado = assento.status === "OCUPADO" || assento.status === "RESERVADO" || assento.status === "VENDIDO";
                      const atingiuLimite = !isSelecionado && selecionados.length >= vagasDisponiveisNoEvento;

                      return (
                        <button
                          key={assento.id}
                          onClick={() => toggleAssento(assento)}
                          disabled={isOcupado || atingiuLimite}
                          className={`w-5 h-5 rounded-xs transition-colors ${
                            isSelecionado
                              ? "bg-[#a11b3e]"
                              : isOcupado
                              ? "bg-red-950/80 border border-red-800/40 text-red-500/50"
                              : atingiuLimite
                              ? "bg-white/5 cursor-not-allowed opacity-30"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2].map(() => {
                      const index = globalSeatCounter++;
                      const assento = assentos[index] || { id: `mock-${index}`, codigo: `${rowLabel}${index}`, status: "LIVRE" };
                      const isSelecionado = selecionados.includes(assento.id);
                      const isOcupado = assento.status === "OCUPADO" || assento.status === "RESERVADO" || assento.status === "VENDIDO";
                      const atingiuLimite = !isSelecionado && selecionados.length >= vagasDisponiveisNoEvento;

                      return (
                        <button
                          key={assento.id}
                          onClick={() => toggleAssento(assento)}
                          disabled={isOcupado || atingiuLimite}
                          className={`w-5 h-5 rounded-xs transition-colors ${
                            isSelecionado
                              ? "bg-[#a11b3e]"
                              : isOcupado
                              ? "bg-red-950/80 border border-red-800/40 text-red-500/50"
                              : atingiuLimite
                              ? "bg-[#white/5] cursor-not-allowed opacity-30"
                              : "bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      );
                    })}
                  </div>

                  <span className="w-4 text-center font-bold">{rowLabel}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-8 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#a11b3e]" /> Selecionado
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-white/20" /> Disponível
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-red-950/80 border border-red-800/40" /> Ocupado
              </span>
            </div>

            {resultadoParcial?.sucesso.length > 0 && (
              <div className="mt-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
                <p className="text-emerald-400 text-xs">
                  {resultadoParcial.sucesso.length} assento(s) reservado(s) com sucesso!
                </p>
                <button
                  onClick={() =>
                    navigate("/pagamento", {
                      state: {
                        reservas: resultadoParcial.sucesso.map((s) => s.reserva),
                        eventoTitulo: evento.titulo,
                      },
                    })
                  }
                  className="font-semibold text-xs uppercase tracking-wider bg-[#e2e8f0] text-black hover:bg-white rounded-full px-5 py-2.5 transition-colors"
                >
                  Ir para Pagamento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {selecionados.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-[#2a0e16] border border-white/15 rounded-full px-8 py-4 flex items-center justify-between shadow-2xl z-50">
          <div>
            <span className="text-white/50 text-[10px] tracking-widest uppercase block">
              {selecionados.length} assento(s) selecionado(s)
            </span>
            <p className="font-display text-2xl text-[#a11b3e] font-bold">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={confirmarReserva}
            disabled={confirmando}
            className="font-semibold text-xs uppercase tracking-wider bg-[#e2e8f0] text-black hover:bg-white disabled:opacity-50 rounded-full px-8 py-3.5 transition-colors shadow-lg"
          >
            {confirmando ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </div>
      )}
    </div>
  );
}