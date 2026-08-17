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

  const scannerRef = useRef(null);

  useEffect(() => {
    listarEventos().then(setEventos);
  }, []);

  useEffect(() => {
    if (eventoId) {
      buscarHistorico(eventoId).then(setHistorico);
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

    try {
      const resposta = await validarIngresso(eventoId, codigo);
      setResultado(resposta.resultado);
    } catch (err) {
      setResultado("INVALIDO");
    } finally {
      setValidando(false);
      setCodigo("");
      buscarHistorico(eventoId).then(setHistorico);
    }
  }

  const estiloResultado = resultado ? VALIDACAO_STYLE[resultado] : null;

  return (
    <div className="min-h-screen bg-bg px-6 md:px-16 py-12">
      <span className="font-sans text-white/40 text-sm tracking-widest uppercase">
        Área da Portaria
      </span>
      <h1 className="font-display text-5xl md:text-6xl text-white tracking-wide mt-2">
        VALIDAR <span className="text-brand">INGRESSO</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <label className="font-sans text-sm text-white/70 block mb-1">
            Evento
          </label>
          <select
            value={eventoId}
            onChange={(e) => {
              setEventoId(e.target.value);
              setResultado(null);
            }}
            className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors mb-4"
          >
            <option value="">Selecione o evento</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titulo}
              </option>
            ))}
          </select>

          <form onSubmit={handleValidar} className="flex flex-col gap-3">
            <label className="font-sans text-sm text-white/70">
              Código do ingresso
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="reservaId:qrHash"
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2 text-white font-sans outline-none focus:border-brand transition-colors"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!eventoId || !codigo || validando}
                className="flex-1 font-sans font-semibold bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-lg py-2 transition-colors"
              >
                {validando ? "Validando..." : "Validar"}
              </button>
              <button
                type="button"
                onClick={() => setCameraAtiva((v) => !v)}
                disabled={!eventoId}
                className="font-sans font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg px-4 transition-colors"
              >
                {cameraAtiva ? "Fechar câmera" : "Ler QR"}
              </button>
            </div>
          </form>

          {cameraAtiva && (
            <div id="leitor-qr" className="mt-4 rounded-lg overflow-hidden" />
          )}

          {estiloResultado && (
            <div
              className={`mt-5 border rounded-lg p-4 text-center ${estiloResultado.bg} ${estiloResultado.border}`}
            >
              <p className={`font-display text-2xl tracking-wide ${estiloResultado.text}`}>
                {estiloResultado.label}
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-2xl tracking-wide text-white mb-4">
            HISTÓRICO
          </h2>
          {!eventoId && (
            <p className="font-sans text-white/40 text-sm">
              Selecione um evento pra ver as últimas validações.
            </p>
          )}
          {eventoId && historico.length === 0 && (
            <p className="font-sans text-white/40 text-sm">
              Nenhuma validação registrada ainda.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {historico.map((linha, index) => (
              <li
                key={index}
                className="font-sans text-sm text-white/70 border-b border-white/5 pb-2"
              >
                {linha}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}