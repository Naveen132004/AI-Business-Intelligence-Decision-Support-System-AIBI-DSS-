import api from "./api";
import type {
  AssistantResponse,
  AssistantSyncResponse,
  AssistantStatus,
} from "../types/sales";

export const assistantApi = {
  ask: async (question: string): Promise<AssistantResponse> => {
    const res = await api.post<AssistantResponse>("/assistant/ask", {
      question,
    });
    return res.data;
  },

  sync: async (): Promise<AssistantSyncResponse> => {
    const res = await api.post<AssistantSyncResponse>("/assistant/sync");
    return res.data;
  },

  getStatus: async (): Promise<AssistantStatus> => {
    const res = await api.get<AssistantStatus>("/assistant/status");
    return res.data;
  },
};
