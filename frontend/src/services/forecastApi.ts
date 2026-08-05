import api from "./api";
import type { ForecastResponse } from "../types/sales";

export const forecastApi = {
  train: async (): Promise<{ message: string; forecast_id: number }> => {
    const res = await api.post<{ message: string; forecast_id: number }>(
      "/forecast/train"
    );
    return res.data;
  },

  getLatest: async (): Promise<ForecastResponse> => {
    const res = await api.get<ForecastResponse>("/forecast/latest");
    return res.data;
  },
};
