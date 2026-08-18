import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    <div className="h-screen w-screen bg-bg relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#581c25]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full h-full bg-white overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-2/5 bg-[#12060a] relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #2d0a14 0%, #1a050b 55%, #0d0e12 100%)",
            }}
          />
          <div
            className="absolute -inset-y-10 -left-1/3 w-[85%]"
            style={{
              background:
                "linear-gradient(160deg, rgba(88,28,37,0.55), rgba(88,28,37,0.05))",
              clipPath: "polygon(0 0, 100% 20%, 55% 50%, 100% 80%, 0 100%)",
            }}
          />
          <div
            className="absolute -inset-y-10 -left-1/4 w-[65%]"
            style={{
              background:
                "linear-gradient(160deg, rgba(217,66,90,0.35), rgba(217,66,90,0.03))",
              clipPath: "polygon(0 0, 100% 30%, 40% 50%, 100% 70%, 0 100%)",
            }}
          />
          <div
            className="absolute -inset-y-10 left-[-8%] w-[38%]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
              clipPath: "polygon(0 0, 100% 38%, 25% 50%, 100% 62%, 0 100%)",
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div>
              <span className="font-sans text-[11px] font-bold text-brand uppercase tracking-[0.2em] block mb-1">
                The Stage Is Yours
              </span>
              <h2 className="font-display text-2xl text-white tracking-wide">
                EVENTOS
              </h2>
            </div>

            <div className="relative my-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => alternarModo(false)}
                className={`relative text-left px-5 py-3 rounded-2xl font-sans text-sm font-semibold transition-colors duration-300 flex items-center justify-between ${
                  !isRegister
                    ? "text-[#1e293b]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {!isRegister && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg -translate-x-1 md:-translate-x-3"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">LOGIN</span>
                {!isRegister && (
                  <span className="relative z-10 w-2 h-2 rounded-full bg-[#581c25]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => alternarModo(true)}
                className={`relative text-left px-5 py-3 rounded-2xl font-sans text-sm font-semibold transition-colors duration-300 flex items-center justify-between ${
                  isRegister
                    ? "text-[#1e293b]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {isRegister && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg -translate-x-1 md:-translate-x-3"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">CADASTRO</span>
                {isRegister && (
                  <span className="relative z-10 w-2 h-2 rounded-full bg-[#581c25]" />
                )}
              </button>
            </div>

            <p className="hidden md:block font-sans text-xs text-white/40 leading-relaxed">
              Cada ingresso é uma história. Acesse sua conta e garanta o seu
              lugar.
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 sm:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "register" : "login"}
              initial={{ opacity: 0, x: isRegister ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRegister ? -24 : 24 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="w-full max-w-sm mx-auto"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-[#581c25] to-brand flex items-center justify-center text-white text-2xl shadow-lg shadow-[#581c25]/30 mb-3">
                  <svg
                    width="28"
                    height="28"
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
                </div>
                <h1 className="font-display text-2xl text-[#1e293b] tracking-wide uppercase">
                  {isRegister ? "Criar Conta" : "Login"}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {isRegister && (
                  <div>
                    <div
                      className={`relative border-b-2 transition-colors py-1 ${
                        fieldErrors.nome
                          ? "border-red-400"
                          : "border-slate-200 focus-within:border-[#581c25]"
                      }`}
                    >
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (fieldErrors.nome)
                            setFieldErrors((f) => ({ ...f, nome: null }));
                        }}
                        placeholder="Nome completo"
                        required
                        className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                        style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
                      />
                    </div>
                    {fieldErrors.nome && (
                      <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                        {fieldErrors.nome}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <div
                    className={`relative border-b-2 transition-colors py-1 ${
                      fieldErrors.email
                        ? "border-red-400"
                        : "border-slate-200 focus-within:border-[#581c25]"
                    }`}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email)
                          setFieldErrors((f) => ({ ...f, email: null }));
                      }}
                      placeholder="E-mail"
                      required
                      className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                      style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div
                    className={`relative border-b-2 transition-colors py-1 ${
                      fieldErrors.senha
                        ? "border-red-400"
                        : "border-slate-200 focus-within:border-[#581c25]"
                    }`}
                  >
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        if (fieldErrors.senha)
                          setFieldErrors((f) => ({ ...f, senha: null }));
                      }}
                      placeholder="Senha"
                      required
                      className="w-full bg-transparent font-sans text-sm placeholder-slate-400 outline-none px-1 py-1"
                      style={{ color: "#1e293b", caretColor: "#581c25", colorScheme: "light" }}
                    />
                  </div>
                  {fieldErrors.senha && (
                    <p className="font-sans text-[11px] text-red-500 mt-1 px-1">
                      {fieldErrors.senha}
                    </p>
                  )}
                </div>

                {!isRegister && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="font-sans text-xs text-[#581c25] hover:underline font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                {error && (
                  <p className="font-sans text-xs text-red-500 text-center">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-sans font-semibold text-xs uppercase tracking-wider bg-[#581c25] hover:bg-[#43121a] text-white rounded-full py-3.5 mt-4 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#581c25]/30 active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? isRegister
                      ? "Cadastrando..."
                      : "Entrando..."
                    : isRegister
                    ? "Cadastrar"
                    : "Entrar"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}