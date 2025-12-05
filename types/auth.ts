export type UserRole = "admin" | "user";

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  provider: "google";
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  isAdmin: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: (signal?: AbortSignal) => Promise<void>;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
