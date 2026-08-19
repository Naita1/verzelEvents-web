import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { listarEventos } from "../services/eventService";
import { validarIngresso, buscarHistorico } from "../services/portariaService";
import { VALIDACAO_STYLE } from "../utils/validacaoVisual";

const inputClass =
  "w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none transition-colors duration-300 focus:border-brand focus:ring-1 focus:ring-brand/30 placeholder:text-white/25";

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
    if (eventoId) {
      buscarHistorico(eventoId).then((dados) =>
        setHistorico(Array.isArray(dados) ? dados : [])
      );
    } else {
      setHistorico([]);
    }
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
    <div className="relative min-h-screen bg-bg px-6 md:px-16 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 left-0 w-[560px] h-[560px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div
          className={`transition-all duration-500 ease-out ${
            visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wide mt-15">
            VALIDAR <span className="text-brand">INGRESSO</span>
          </h1>
          <div className="h-px w-full max-w-[10rem] bg-gradient-to-r from-brand/60 to-transparent mt-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div
            className={`bg-surface border border-white/10 rounded-2xl p-6 md:p-7 transition-all duration-500 ease-out delay-75 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <h2 className="font-display text-2xl tracking-wide text-white mb-1">
              VALIDAÇÃO
            </h2>
            <p className="font-sans text-white/40 text-xs mb-6">
              Selecione o evento e escaneie o QR Code ou insira o código manualmente.
            </p>

            <div className="mb-4">
              <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                Evento
              </label>
              <select
                value={eventoId}
                onChange={(e) => {
                  setEventoId(e.target.value);
                  setResultado(null);
                }}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="" className="bg-bg text-white/50">
                  Selecione o evento...
                </option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-bg text-white">
                    {ev.titulo}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleValidar} className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                  Código do Ingresso
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="reservaId:qrHash"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  disabled={!eventoId || !codigo || validando}
                  className="flex-1 font-sans text-xs font-semibold uppercase tracking-wider bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-full py-3 transition-colors duration-300"
                >
                  {validando ? "Validando..." : "Validar"}
                </button>
                <button
                  type="button"
                  onClick={() => setCameraAtiva((v) => !v)}
                  disabled={!eventoId}
                  className="font-sans text-xs font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-full px-5 py-3 transition-colors duration-300 shrink-0"
                >
                  {cameraAtiva ? "Fechar Câmera" : "📷 Ler QR"}
                </button>
              </div>
            </form>

            {cameraAtiva && (
              <div className="mt-5 border border-white/10 bg-bg rounded-xl p-3 animate-[fadeIn_0.35s_ease-out_both]">
                <div id="leitor-qr" className="rounded-lg overflow-hidden border border-white/10" />
                <p className="font-sans text-white/40 text-[11px] text-center mt-2">
                  Aponte a câmera para o QR Code do ingresso
                </p>
              </div>
            )}

            {estiloResultado && (
              <div
                className={`mt-6 border rounded-xl p-5 text-center transition-all duration-300 animate-[fadeIn_0.35s_ease-out_both] ${estiloResultado.bg} ${estiloResultado.border}`}
              >
                <p className={`font-display text-3xl tracking-wide ${estiloResultado.text}`}>
                  {estiloResultado.label}
                </p>
              </div>
            )}
          </div>

          <div
            className={`bg-surface border border-white/10 rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-500 ease-out delay-150 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl tracking-wide text-white">
                HISTÓRICO
              </h2>
              {eventoId && historico.length > 0 && (
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60 rounded-full px-3 py-1">
                  {historico.length} registro(s)
                </span>
              )}
            </div>

            {!eventoId && (
              <div className="flex flex-col items-center justify-center text-center py-12 my-auto">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-3">
                  📋
                </div>
                <p className="font-sans text-white/40 text-sm">
                  Selecione um evento para ver o histórico de validações.
                </p>
              </div>
            )}

            {eventoId && historico.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 my-auto">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl mb-3">
                  🎟️
                </div>
                <p className="font-sans text-white/40 text-sm">
                  Nenhuma validação registrada para este evento até o momento.
                </p>
              </div>
            )}

            {eventoId && historico.length > 0 && (
              <ul className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {historico.map((linha, index) => (
                  <li
                    key={index}
                    style={{ transitionDelay: `${Math.min(index, 8) * 30}ms` }}
                    className="bg-bg border border-white/10 rounded-lg p-3.5 text-xs font-mono text-white/80 transition-all duration-300 hover:border-white/20 animate-[fadeIn_0.35s_ease-out_both] flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span className="truncate">{linha}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}