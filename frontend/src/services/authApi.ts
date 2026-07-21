import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  // ── Profile ──────────────────────────────────────────

  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>("/users/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    const response = await api.put<UserProfileResponse>("/users/me", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>("/users/me/password", data);
    return response.data;
  },
};
