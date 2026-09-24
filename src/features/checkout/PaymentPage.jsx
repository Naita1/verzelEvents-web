import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pagarReserva } from "./api";

function useCountdown(expiresAt) {
  const [prevExpiresAt, setPrevExpiresAt] = useState(expiresAt);
  const [restante, setRestante] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null
  );

  if (prevExpiresAt !== expiresAt) {
    setPrevExpiresAt(expiresAt);
    setRestante(
      expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : null
    );
  }

  useEffect(() => {
    if (!expiresAt) return;

    const calcular = () => Math.max(0, new Date(expiresAt).getTime() - Date.now());
    if (calcular() <= 0) return;

    const intervalo = setInterval(() => {
      const diff = calcular();
      setRestante(diff);
      if (diff <= 0) {
        clearInterval(intervalo);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [expiresAt]);

  if (restante === null) {
    return { restante: null, texto: "--:--" };
  }

  const minutos = Math.floor(restante / 60000);
  const segundos = Math.floor((restante % 60000) / 1000);

  return { restante, texto: `${minutos}:${String(segundos).padStart(2, "0")}` };
}

const inputClass =
  "w-full bg-[#120408]/80 border border-white/15 rounded-xl px-4 py-3 text-white font-sans text-sm outline-none transition-all duration-300 focus:border-brand focus:ring-2 focus:ring-brand/30 placeholder:text-white/40";

function formatarMoeda(valor) {
  if (!valor || isNaN(valor)) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarPreviewCartao(numero) {
  if (!numero) return "•••• •••• •••• ••••";
  const limpo = numero.replace(/\s/g, "");
  const preenchido = (limpo + "••••••••••••••••").slice(0, 16);
  return preenchido.replace(/(.{4})/g, "$1 ").trim();
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservas, eventoTitulo } = location.state || {};

  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeTitular, setNomeTitular] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisivel(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const expiraMaisCedo = useMemo(() => {
    if (!reservas?.length) return null;
    return reservas.reduce((maisCedo, r) => {
      if (!r.expiresAt) return maisCedo;
      if (!maisCedo) return r.expiresAt;
      return new Date(r.expiresAt).getTime() < new Date(maisCedo).getTime()
        ? r.expiresAt
        : maisCedo;
    }, null);
  }, [reservas]);

  const valorTotal = useMemo(() => {
    if (!reservas?.length) return 0;
    return reservas.reduce((total, r) => {
      const v = Number(r.valorIngresso || r.valor || r.preco || 0);
      return total + (isNaN(v) ? 0 : v);
    }, 0);
  }, [reservas]);

  const { restante, texto } = useCountdown(expiraMaisCedo);

  useEffect(() => {
    if (reservas?.length && expiraMaisCedo && restante === 0) {
      navigate("/", { state: { expirado: true } });
    }
  }, [restante, reservas, expiraMaisCedo, navigate]);

  function handleNumeroCartaoChange(e) {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    val = val.replace(/(.{4})/g, "$1 ").trim();
    setNumeroCartao(val);
  }

  function handleValidadeChange(e) {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      const mes = parseInt(val.slice(0, 2), 10);
      if (mes > 12) val = "12" + val.slice(2);
      else if (mes === 0 && val.length === 2) val = "01" + val.slice(2);
    }
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setValidade(val);
  }

  function handleCvvChange(e) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessando(true);
    setResultado(null);

    const dadosCartao = {
      numeroCartao: numeroCartao.replace(/\s/g, ""),
      nomeCartao: nomeTitular,
      validade,
      cvv,
    };

    const resultados = await Promise.allSettled(
      reservas.map((r) => pagarReserva(r.id, dadosCartao))
    );

    const sucesso = [];
    const falha = [];

    resultados.forEach((res, index) => {
      const reserva = reservas[index];
      if (res.status === "fulfilled") {
        sucesso.push({ reserva, ingresso: res.value });
      } else {
        falha.push({ reserva, erro: res.reason?.message });
      }
    });

    setProcessando(false);
    setResultado({ sucesso, falha });
  }

  if (!reservas?.length) {
    return (
      <div className="relative min-h-screen bg-[#0d0306] flex flex-col items-center justify-center px-6 py-12 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-140 h-140 rounded-full opacity-[0.15] blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="relative z-10 bg-[#17050b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <p className="font-sans text-white/60 text-sm">
            Nenhuma reserva pendente foi encontrada.
          </p>
          <button
            onClick={() => navigate("/")}
            className="font-sans text-xs font-semibold uppercase tracking-wider bg-brand hover:bg-brand-hover text-white rounded-full px-7 py-3 transition-all duration-300 shadow-lg shadow-brand/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand mt-2"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  if (resultado && resultado.falha.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#0d0306] flex flex-col items-center justify-center px-6 py-12 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-140 h-140 rounded-full opacity-[0.15] blur-3xl"
          style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
        />
        <div className="relative z-10 bg-[#17050b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 max-w-md w-full flex flex-col items-center gap-5 shadow-2xl animate-[fadeIn_0.5s_ease-out_both]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-3xl">
            ✓
          </div>
          <div>
            <h1 className="font-display text-4xl text-white tracking-wide">
              PAGAMENTO <span className="text-emerald-400">CONFIRMADO</span>
            </h1>
            <p className="font-sans text-white/50 text-xs uppercase tracking-wider mt-1">
              {eventoTitulo}
            </p>
          </div>
          <p className="font-sans text-white/70 text-sm leading-relaxed">
            Seu(s) <strong className="text-white">{reservas.length} ingresso(s)</strong> foi(ram) emitido(s) com sucesso. Acesse seus ingressos para visualizar os QR Codes de entrada.
          </p>
          <button
            onClick={() => navigate("/meus-ingressos")}
            className="w-full font-sans text-xs font-semibold uppercase tracking-wider bg-brand hover:bg-brand-hover text-white rounded-full py-3.5 transition-all duration-300 shadow-lg shadow-brand/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand mt-2"
          >
            Ver Meus Ingressos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0d0306] px-6 md:px-16 py-12 font-sans overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 left-0 w-140 h-140 rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div
          className={`transition-all duration-500 ease-out ${
            visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="font-sans text-white/40 text-xs md:text-sm tracking-[0.25em] uppercase">
            Checkout Seguro
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wide mt-2">
            FINALIZAR <span className="text-brand">PAGAMENTO</span>
          </h1>
          <div className="h-px w-full max-w-40 bg-linear-to-r from-brand/60 to-transparent mt-5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          <div
            className={`lg:col-span-5 bg-[#17050b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-7 flex flex-col justify-between shadow-2xl transition-all duration-500 ease-out delay-75 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[11px] text-white/40 uppercase tracking-wider">
                  Tempo Restante
                </span>
                {restante !== null && (
                  <div
                    aria-live="polite"
                    className={`flex items-center gap-2 font-sans text-xs font-bold px-3 py-1 rounded-full border transition-all duration-300 ${
                      restante < 60000
                        ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                        : "bg-white/10 border-white/10 text-white/80"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {texto}
                  </div>
                )}
              </div>

              <h2 className="font-display text-2xl tracking-wide text-white mb-2">
                RESUMO DA RESERVA
              </h2>
              <div className="bg-[#120408]/80 border border-white/10 rounded-2xl p-4 mb-6">
                <p className="font-sans text-white font-semibold text-base mb-1">
                  {eventoTitulo}
                </p>
                <p className="font-sans text-white/50 text-xs">
                  {reservas.length} ingresso(s) selecionado(s)
                </p>
              </div>

              <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4 max-h-52 overflow-y-auto pr-1">
                {reservas.map((r, index) => (
                  <div key={r.id || index} className="flex justify-between items-center text-xs bg-white/5 px-3 py-2 rounded-lg">
                    <span className="font-sans text-white/80 font-medium">
                      {r.assentoCodigo || r.codigoAssento ? `Assento ${r.assentoCodigo || r.codigoAssento}` : `Ingresso #${index + 1}`}
                    </span>
                    <span className="text-white/50 font-mono text-[11px]">
                      {r.valor || r.valorIngresso ? formatarMoeda(r.valor || r.valorIngresso) : `#${r.id?.toString().slice(0, 8)}`}
                    </span>
                  </div>
                ))}
              </div>

              {valorTotal > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="font-sans text-xs uppercase tracking-wider text-white/50">Total a pagar</span>
                  <span className="font-sans text-lg font-bold text-emerald-400">{formatarMoeda(valorTotal)}</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/40 text-[11px]">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Transação segura e criptografada</span>
              </div>
            </div>
          </div>
          <div
            className={`lg:col-span-7 bg-[#17050b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-7 shadow-2xl transition-all duration-500 ease-out delay-150 ${
              visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <h2 className="font-display text-2xl tracking-wide text-white mb-1">
              DADOS DO CARTÃO
            </h2>
            <p className="font-sans text-white/40 text-xs mb-6">
              Insira os dados do cartão de crédito para processar o pagamento.
            </p>

            {/* Pré-visualização estética do Cartão */}
            <div className="mb-6 p-5 rounded-2xl bg-linear-to-tr from-[#250812] via-[#43101e] to-[#67142b] border border-white/15 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Cartão de Crédito</span>
                <span className="w-9 h-6 rounded bg-amber-400/80 inline-block border border-amber-300 shadow-sm" />
              </div>
              <p className="font-mono text-base sm:text-lg tracking-[0.18em] mb-4 text-white/95">
                {formatarPreviewCartao(numeroCartao)}
              </p>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-white/50">Titular</span>
                  <span className="font-medium tracking-wide uppercase truncate max-w-45 block">
                    {nomeTitular || "NOME DO CLIENTE"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] uppercase tracking-wider text-white/50">Validade</span>
                  <span className="font-mono">{validade || "MM/AA"}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={numeroCartao}
                  onChange={handleNumeroCartaoChange}
                  required
                  inputMode="numeric"
                  minLength={19}
                  maxLength={19}
                  autoComplete="cc-number"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="Nome impresso no cartão"
                  value={nomeTitular}
                  onChange={(e) => setNomeTitular(e.target.value)}
                  required
                  autoComplete="cc-name"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={validade}
                    onChange={handleValidadeChange}
                    required
                    inputMode="numeric"
                    minLength={5}
                    maxLength={5}
                    autoComplete="cc-exp"
                    className={inputClass}
                  />
                </div>
                <div className="w-32">
                  <label className="font-sans text-[11px] text-white/50 uppercase tracking-wider block mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    required
                    inputMode="numeric"
                    minLength={3}
                    maxLength={4}
                    autoComplete="cc-csc"
                    className={inputClass}
                  />
                </div>
              </div>

              {resultado?.falha.length > 0 && (
                <div role="alert" className="bg-red-950/40 border border-red-500/30 rounded-xl px-4 py-3 animate-[fadeIn_0.3s_ease-out_both]">
                  <p className="font-sans text-red-400 text-xs font-semibold">
                    Pagamento Recusado
                  </p>
                  {resultado.sucesso.length > 0 && (
                    <p className="font-sans text-amber-300 text-xs mt-1">Atenção: {resultado.sucesso.length} ingresso(s) foram processados com sucesso antes do erro.</p>
                  )}
                  <p className="font-sans text-red-400/80 text-xs mt-0.5">
                    {resultado.falha[0].erro || "Cartão recusado. Verifique os dados e tente novamente."}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={processando}
                aria-busy={processando}
                className="font-sans font-semibold text-xs uppercase tracking-wider bg-brand hover:bg-brand-hover disabled:opacity-50 text-white rounded-full py-3.5 mt-2 transition-all duration-300 shadow-lg shadow-brand/25 flex items-center justify-center gap-2 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {processando ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Processando Pagamento...
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </button>

              <p className="font-sans text-white/30 text-[11px] text-center mt-1">
                Pagamento simulado — utilize final <span className="font-mono text-white/50">0000</span> para testar recusa.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}