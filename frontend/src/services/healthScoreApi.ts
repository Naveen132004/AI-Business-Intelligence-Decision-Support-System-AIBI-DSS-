import api from "./api";
import type { HealthScoreResponse } from "../types/sales";

export const healthScoreApi = {
  calculate: async (): Promise<{ message: string; score_id: number }> => {
    const res = await api.post<{ message: string; score_id: number }>(
      "/health-score/calculate"
    );
    return res.data;
  },

  getLatest: async (): Promise<HealthScoreResponse> => {
    const res = await api.get<HealthScoreResponse>("/health-score/latest");
    return res.data;
  },
};
