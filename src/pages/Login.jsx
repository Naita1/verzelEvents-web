import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function alternarModo(modoRegister) {
    setIsRegister(modoRegister);
    setError(null);
    setFieldErrors({});
  }

  function validate() {
    const errs = {};

    if (isRegister && nome.trim().length < 3) {
      errs.nome = "Informe seu nome completo.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errs.email = "Informe um e-mail válido.";
    }

    if (senha.length < 6) {
      errs.senha = "A senha precisa ter pelo menos 6 caracteres.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      if (isRegister) {
        if (register) {
          await register(nome, email, senha);
        }
        await login(email, senha);
      } else {
        await login(email, senha);
      }
      navigate("/");
    } catch (err) {
      setError(
        err.message ||
          (isRegister
            ? "Não foi possível criar a conta."
            : "Não foi possível entrar. Verifique suas credenciais.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-140 h-140 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/4 w-120 h-120 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-5xl bg-[#140509]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-160">
        <div className="lg:col-span-5 bg-linear-to-b from-[#1b060d]/90 via-[#120408]/95 to-[#0b0306] p-8 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          <div
            className="pointer-events-none absolute top-0 left-0 w-80 h-80 rounded-full opacity-25 blur-2xl"
            style={{ background: "radial-gradient(circle, #a11b3e 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 mb-6 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-bold text-brand uppercase tracking-[0.22em]">
                Acesso Exclusivo
              </span>
            </div>

            <div>
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide uppercase leading-tight">
                VIVA O SEU <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-brand via-[#e63968] to-brand">
                  MELHOR MOMENTO
                </span>
              </h2>
              <p className="font-sans text-xs text-white/60 mt-3 leading-relaxed">
                Reserve assentos numerados em tempo real, acompanhe seus ingressos digitais e valide acessos com segurança em shows, teatros e cinemas.
              </p>
            </div>
          </div>

          <div className="relative z-10 my-8 space-y-3.5 hidden sm:block">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand text-[10px] font-bold">
                ✓
              </span>
              <span>Assentos em tempo real com mapa interativo</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand text-[10px] font-bold">
                ✓
              </span>
              <span>Ingressos criptografados com QR Code dinâmico</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-5 h-5 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand text-[10px] font-bold">
                ✓
              </span>
              <span>Reserva idempotente e checkout simulado instantâneo</span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between">
            <span>Verzel Events Platform</span>
            <span className="text-brand font-semibold">v1.0</span>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="relative bg-black/40 border border-white/10 rounded-2xl p-1.5 flex gap-1 mb-8 shadow-inner">
              <button
                type="button"
                onClick={() => alternarModo(false)}
                className={`relative flex-1 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-200 z-10 cursor-pointer ${
                  !isRegister ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {!isRegister && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-brand rounded-xl shadow-lg shadow-brand/40"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => alternarModo(true)}
                className={`relative flex-1 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-200 z-10 cursor-pointer ${
                  isRegister ? "text-white" : "text-white/50 hover:text-white/80"
                }`}
              >
                {isRegister && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-brand rounded-xl shadow-lg shadow-brand/40"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Criar Conta</span>
              </button>
            </div>
            <div className="mb-6">
              <h3 className="font-display text-2xl sm:text-3xl text-white tracking-wide uppercase">
                {isRegister ? "Comece sua jornada" : "Bem-vindo de volta"}
              </h3>
              <p className="font-sans text-xs text-white/50 mt-1">
                {isRegister
                  ? "Preencha seus dados para criar sua conta de cliente."
                  : "Digite suas credenciais para gerenciar ingressos e reservas."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isRegister ? "register" : "login"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {isRegister && (
                  <div>
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
                      Nome Completo
                    </label>
                    <div
                      className={`relative flex items-center bg-[#0b0306]/90 border rounded-xl px-3.5 py-3 transition-colors ${
                        fieldErrors.nome
                          ? "border-red-500/70 ring-1 ring-red-500/30"
                          : "border-white/10 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/40"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-white/35 mr-3 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (fieldErrors.nome)
                            setFieldErrors((f) => ({ ...f, nome: null }));
                        }}
                        placeholder="Seu nome completo"
                        required
                        className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none"
                      />
                    </div>
                    {fieldErrors.nome && (
                      <p className="font-sans text-[11px] text-red-400 mt-1 px-1">
                        {fieldErrors.nome}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
                    E-mail
                  </label>
                  <div
                    className={`relative flex items-center bg-[#0b0306]/90 border rounded-xl px-3.5 py-3 transition-colors ${
                      fieldErrors.email
                        ? "border-red-500/70 ring-1 ring-red-500/30"
                        : "border-white/10 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/40"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white/35 mr-3 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email)
                          setFieldErrors((f) => ({ ...f, email: null }));
                      }}
                      placeholder="seu.email@exemplo.com"
                      required
                      className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="font-sans text-[11px] text-red-400 mt-1 px-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-sans text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Senha
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() =>
                          setError("Para redefinir sua senha, entre em contato com o suporte da organização.")
                        }
                        className="font-sans text-[11px] text-brand hover:text-brand-hover hover:underline cursor-pointer"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div
                    className={`relative flex items-center bg-[#0b0306]/90 border rounded-xl px-3.5 py-3 transition-colors ${
                      fieldErrors.senha
                        ? "border-red-500/70 ring-1 ring-red-500/30"
                        : "border-white/10 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/40"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white/35 mr-3 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        if (fieldErrors.senha)
                          setFieldErrors((f) => ({ ...f, senha: null }));
                      }}
                      placeholder="Mínimo de 6 caracteres"
                      required
                      className="w-full bg-transparent font-sans text-sm text-white placeholder-white/30 outline-none pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((v) => !v)}
                      aria-label={mostrarSenha ? "Ocultar senha" : "Exibir senha"}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                    >
                      {mostrarSenha ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.senha && (
                    <p className="font-sans text-[11px] text-red-400 mt-1 px-1">
                      {fieldErrors.senha}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <svg
                      className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="font-sans text-xs text-red-300 leading-snug">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-sans font-bold text-xs uppercase tracking-wider bg-linear-to-r from-brand via-[#bd224b] to-brand text-white rounded-full py-3.5 mt-2 transition-all duration-300 shadow-lg shadow-brand/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{isRegister ? "Cadastrando..." : "Entrando..."}</span>
                    </>
                  ) : (
                    <span>{isRegister ? "Concluir Cadastro" : "Acessar Plataforma"}</span>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}