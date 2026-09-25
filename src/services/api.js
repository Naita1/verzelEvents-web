import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime || Date.now());
    if (duration > 3000) {
      console.warn(`[API SLOW] ${response.config.method?.toUpperCase()} ${response.config.url} demorou ${(duration / 1000).toFixed(2)}s`);
    }
    return response;
  },
  (error) => {
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    
    const message =
      isTimeout
        ? "O servidor demorou muito para responder. Aguarde alguns instantes (o servidor pode estar iniciando) e tente novamente."
        :
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Ocorreu um erro inesperado. Tente novamente.";

    const status = error.response?.status;

    return Promise.reject({ status, message, original: error });
  }
);

export default api;