import type { User, LogoutResponse } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getGoogleLoginUrl(): string {
  return `${API_BASE_URL}/api/auth/google`;
}

export async function getCurrentUser(
  signal?: AbortSignal
): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("取得使用者資訊失敗");
    }

    return response.json();
  } catch (error) {
    // 忽略 AbortError
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    console.error("取得使用者資訊錯誤:", error);
    return null;
  }
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("登出失敗");
  }

  return response.json();
}
