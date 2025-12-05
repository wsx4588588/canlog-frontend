import { API_BASE_URL } from "./utils";
import type { CannedFood, PaginatedResponse, AnalyzeResponse } from "./types";

interface QueryParams {
  search?: string;
  brandName?: string;
  minPhosphorusPer100kcal?: number;
  maxPhosphorusPer100kcal?: number;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export async function getCannedFoods(
  params: QueryParams = {}
): Promise<PaginatedResponse<CannedFood>> {
  const { signal, ...queryParams } = params;
  const searchParams = new URLSearchParams();

  if (queryParams.search) searchParams.set("search", queryParams.search);
  if (queryParams.brandName)
    searchParams.set("brandName", queryParams.brandName);
  if (queryParams.minPhosphorusPer100kcal !== undefined)
    searchParams.set(
      "minPhosphorusPer100kcal",
      queryParams.minPhosphorusPer100kcal.toString()
    );
  if (queryParams.maxPhosphorusPer100kcal !== undefined)
    searchParams.set(
      "maxPhosphorusPer100kcal",
      queryParams.maxPhosphorusPer100kcal.toString()
    );
  if (queryParams.page) searchParams.set("page", queryParams.page.toString());
  if (queryParams.limit)
    searchParams.set("limit", queryParams.limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods?${searchParams.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch canned foods");
  }

  return response.json();
}

export async function getCannedFood(id: number): Promise<CannedFood> {
  const response = await fetch(`${API_BASE_URL}/api/canned-foods/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch canned food");
  }

  return response.json();
}

export async function getBrands(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/canned-foods/brands`);

  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }

  const data = await response.json();
  return data.brands;
}

export async function analyzeImage(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/canned-foods/analyze`, {
    method: "POST",
    body: formData,
    credentials: "include", // 需要登入驗證
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to analyze image");
  }

  return response.json();
}

export async function deleteCannedFood(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/canned-foods/${id}`, {
    method: "DELETE",
    credentials: "include", // 需要登入驗證
  });

  if (!response.ok) {
    throw new Error("Failed to delete canned food");
  }
}

export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}
