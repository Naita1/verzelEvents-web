import api from "./api";

export async function buscarCatalogo(query) {
  const response = await api.get("/organizador/eventos/catalogo", {
    params: { query },
  });
  return response.data;
}

export async function criarEvento(dados) {
  const response = await api.post("/organizador/eventos", dados);
  return response.data;
}

export async function listarMeusEventos() {
  const response = await api.get("/organizador/eventos");
  return response.data;
}