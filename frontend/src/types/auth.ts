export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}

// ── Profile DTOs ──────────────────────────────────────────

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
