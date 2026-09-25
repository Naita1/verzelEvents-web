import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { listarEventos } from "../services/eventService";
import { validarIngresso, buscarHistorico } from "../services/portariaService";
import { VALIDACAO_STYLE } from "../utils/validacaoVisual";

export default function Portaria() {
  const [eventos, setEventos] = useState([]);
  const [eventoId, setEventoId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [validando, setValidando] = useState(false);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [visivel, setVisivel] = useState(false);

  const scannerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listarEventos().then((dados) =>
      setEventos(Array.isArray(dados) ? dados : dados?.content || [])
    );
  }, []);

  useEffect(() => {
    if (!eventoId) return;

    buscarHistorico(eventoId).then((dados) =>
      setHistorico(Array.isArray(dados) ? dados : [])
    );
  }, [eventoId]);

  useEffect(() => {
    if (!cameraAtiva) return;

    const scanner = new Html5Qrcode("leitor-qr");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (textoLido) => {
          setCodigo(textoLido);
          setCameraAtiva(false);
        },
        () => {}
      )
      .catch(() => setCameraAtiva(false));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [cameraAtiva]);

  async function handleValidar(e) {
    e.preventDefault();
    if (!eventoId || !codigo) return;

    setValidando(true);
    setResultado(null);

    const codigoLimpo = codigo.trim();

    try {
      const resposta = await validarIngresso(eventoId, codigoLimpo);
      
      const statusValido = resposta?.resultado || resposta?.status || resposta;
      setResultado(statusValido);
    } catch (err) {
      console.error("Erro detalhado da validação:", err.response || err);

      if (err.response?.data?.resultado) {
        setResultado(err.response.data.resultado);
      } else if (err.response?.data?.status) {
        setResultado(err.response.data.status);
      } else if (err.response?.status === 403) {
        alert("Acesso negado (403): Seu usuário não tem permissão de Portaria.");
        setResultado("INVALIDO");
      } else {
        setResultado("INVALIDO");
      }
    } finally {
      setValidando(false);
      setCodigo("");
      buscarHistorico(eventoId).then((dados) =>
        setHistorico(Array.isArray(dados) ? dados : [])
      );
    }
  }

  const estiloResultado = resultado ? VALIDACAO_STYLE[resultado] : null;

  return (
    <div className="relative min-h-screen bg-bg px-4 sm:px-8 md:px-12 lg:px-16 pt-28 pb-24 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-140 h-140 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-10 w-120 h-120 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div
          className={`transition-all duration-700 ease-out mb-10 ${
            visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-3 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-[10px] font-bold text-brand uppercase tracking-[0.22em]">
              Controle de Acesso
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase">
            VALIDAÇÃO DE <span className="text-transparent bg-clip-text bg-linear-to-r from-brand via-[#e63968] to-brand">PORTARIA</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-white/50 max-w-xl mt-2 leading-relaxed">
            Realize a conferência biométrica ou manual de e-tickets, escaneie QR Codes pela câmera e audite o fluxo de entrada em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div
            className={`lg:col-span-7 bg-[#140509]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out delay-75 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-white uppercase">
                  Verificação de Acesso
                </h2>
                <p className="font-sans text-white/40 text-xs mt-0.5">
                  Selecione o espetáculo e faça a leitura do código do ingresso
                </p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand text-sm font-bold">
                ✓
              </span>
            </div>

            <div className="mb-5">
              <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                Evento Selecionado
              </label>
              <div className="relative">
                <select
                  value={eventoId}
                  onChange={(e) => {
                    const novoId = e.target.value;
                    setEventoId(novoId);
                    setResultado(null);
                    if (!novoId) {
                      setHistorico([]);
                    }
                  }}
                  className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 cursor-pointer appearance-none pr-10"
                >
                  <option value="" className="bg-[#140509] text-white/50">
                    Selecione o evento para abrir a portaria...
                  </option>
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id} className="bg-[#140509] text-white">
                      {ev.titulo} — {ev.local}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
            <form onSubmit={handleValidar} className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-[11px] text-white/60 font-bold uppercase tracking-wider block mb-1.5">
                  Código do Ingresso (Hash / Reserva)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Cole ou digite: reservaId:qrHash"
                    className="w-full bg-[#0b0306]/90 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand/40 placeholder:text-white/25 placeholder:font-sans"
                  />
                  {codigo && (
                    <button
                      type="button"
                      onClick={() => setCodigo("")}
                      className="absolute right-3 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <button
                  type="submit"
                  disabled={!eventoId || !codigo || validando}
                  className="flex-1 font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white rounded-full py-3.5 transition-all duration-300 shadow-lg shadow-brand/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                >
                  {validando ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Validando Ingresso...</span>
                    </>
                  ) : (
                    <span>Validar Ingresso</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCameraAtiva((v) => !v)}
                  disabled={!eventoId}
                  className={`font-sans font-bold text-xs uppercase tracking-wider rounded-full px-6 py-3.5 transition-all duration-300 border flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 shrink-0 ${
                    cameraAtiva
                      ? "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
                      : "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                  }`}
                >
                  {cameraAtiva ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <span>Fechar Câmera</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 7V4h3" />
                        <path d="M20 7V4h-3" />
                        <path d="M4 17v3h3" />
                        <path d="M20 17v3h-3" />
                        <rect x="7" y="7" width="10" height="10" rx="1" />
                      </svg>
                      <span>Escanear QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {cameraAtiva && (
              <div className="mt-6 border border-brand/30 bg-[#0b0306] rounded-2xl p-4 sm:p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                      Scanner Ativo
                    </span>
                  </div>
                  <span className="font-sans text-[11px] text-white/40">
                    Aponte para o QR Code do ingresso
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black">
                  <div id="leitor-qr" className="w-full" />
                </div>

                <p className="font-sans text-white/40 text-[11px] text-center mt-3">
                  O leitor identificará e validará o ingresso instantaneamente
                </p>
              </div>
            )}
            {estiloResultado && (
              <div
                className={`mt-6 border rounded-2xl p-6 text-center transition-all shadow-xl animate-in fade-in zoom-in-95 duration-300 ${estiloResultado.bg} ${estiloResultado.border}`}              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black/30 border border-current mb-2">
                  <span className={`text-xl font-bold ${estiloResultado.text}`}>
                    {resultado === "VALIDO" ? "✓" : "!"}
                  </span>
                </div>
                <p className={`font-display text-3xl sm:text-4xl tracking-wide uppercase ${estiloResultado.text}`}>
                  {estiloResultado.label}
                </p>
                <p className="font-sans text-xs text-white/60 mt-1">
                  {resultado === "VALIDO"
                    ? "Entrada liberada. Acesso registrado na auditoria."
                    : "Acesso bloqueado. Verifique a autenticidade do e-ticket."}
                </p>
              </div>
            )}
          </div>
          <div
            className={`lg:col-span-5 bg-[#140509]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-500 ease-out delay-150 flex flex-col justify-between ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <div>
                  <h2 className="font-display text-2xl tracking-wide text-white uppercase">
                    Auditoria de Acesso
                  </h2>
                  <p className="font-sans text-white/40 text-xs mt-0.5">
                    Histórico recente de leituras para o evento
                  </p>
                </div>
                {eventoId && (
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-brand rounded-full px-3 py-1 shadow-xs">
                    {historico.length} {historico.length === 1 ? "leitura" : "leituras"}
                  </span>
                )}
              </div>

              {!eventoId && (
                <div className="flex flex-col items-center text-center py-16 px-4 bg-[#0b0306]/50 rounded-2xl border border-dashed border-white/10 my-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mb-4 text-brand shadow-inner">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="font-display text-lg text-white uppercase tracking-wide mb-1">
                    Nenhum Evento Selecionado
                  </p>
                  <p className="font-sans text-white/40 text-xs max-w-xs leading-relaxed">
                    Selecione o espetáculo desejado na caixa ao lado para carregar o histórico de entradas e ativar o leitor.
                  </p>
                </div>
              )}

              {eventoId && historico.length === 0 && (
                <div className="flex flex-col items-center text-center py-16 px-4 bg-[#0b0306]/50 rounded-2xl border border-dashed border-white/10 my-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40 shadow-inner">
                    <svg className="w-7 h-7 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="font-display text-lg text-white uppercase tracking-wide mb-1">
                    Fila Aberta / Sem Validações
                  </p>
                  <p className="font-sans text-white/40 text-xs max-w-xs leading-relaxed">
                    Nenhum ingresso foi validado ainda para este evento. As leituras efetuadas aparecerão aqui em tempo real.
                  </p>
                </div>
              )}

              {eventoId && historico.length > 0 && (
                <ul className="flex flex-col gap-2.5 max-h-115 overflow-y-auto pr-1">
                  {historico.map((linha, index) => (
                    <li
                      key={index}
                      className="bg-[#0b0306]/90 border border-white/10 hover:border-brand/40 rounded-xl p-3.5 text-xs font-mono text-white/80 transition-all duration-200 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0 group-hover:scale-125 transition-transform" />
                        <span className="truncate">{linha}</span>
                      </div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-white/30 shrink-0">
                        Registrado
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between">
              <span>Estação de Portaria Verzel</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}