import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Ocorreu um erro inesperado. Tente novamente.";

    const status = error.response?.status;

    if (status === 401 || status === 403) {
    }

    return Promise.reject({ status, message, original: error });
  }
);

export default api;