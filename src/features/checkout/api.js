import api from "../../services/api";

export async function pagarReserva(reservaId, dadosCartao) {
  const response = await api.post(
    `/cliente/reservas/${reservaId}/pagamento`,
    dadosCartao
  );
  return response.data;
}