import api from "./api";

export async function listarEventos() {
  const response = await api.get("/eventos");
  return response.data;
}