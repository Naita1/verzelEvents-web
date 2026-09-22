import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarAssentos, reservarAssento } from "../../../services/seatService";
import api from "../../../services/api";

async function buscarEvento(eventoId) {
  const response = await api.get(`/eventos/${eventoId}`);
  return response.data;
}

export function useEventDetail(eventoId) {
  const queryClient = useQueryClient();

  const eventoQuery = useQuery({
    queryKey: ["event", eventoId],
    queryFn: () => buscarEvento(eventoId),
    enabled: Boolean(eventoId),
  });

  const assentosQuery = useQuery({
    queryKey: ["event", eventoId, "seats"],
    queryFn: () => listarAssentos(eventoId),
    enabled: Boolean(eventoId),
  });

  const reservarMutation = useMutation({
    mutationFn: async ({ eventoId: id, assentoIds }) => {
      const resultados = await Promise.allSettled(
        assentoIds.map((assentoId) => reservarAssento(id, assentoId))
      );
      return { resultados, assentoIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event", eventoId, "seats"],
      });
    },
  });

  return {
    evento: eventoQuery.data,
    assentos: assentosQuery.data || [],
    isLoading: eventoQuery.isLoading || assentosQuery.isLoading,
    error: eventoQuery.error || assentosQuery.error,
    reservarMutation,
  };
}
