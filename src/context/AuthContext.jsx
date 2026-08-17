import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedNome = localStorage.getItem("nome");
    const savedRole = localStorage.getItem("role");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setUser({ nome: savedNome, role: savedRole });
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const { token, nome, role } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("nome", nome);
    localStorage.setItem("role", role);

    setToken(token);
    setUser({ nome, role });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}