import { API_BASE_URL } from "./utils";
import type { CannedFood, PaginatedResponse, AnalyzeResponse } from "./types";

interface QueryParams {
  search?: string;
  brandName?: string;
  page?: number;
  limit?: number;
}

// API 回傳的營養值結構
interface NutritionValue {
  value: number | null;
  unit: string | null;
}

// API 回傳的原始資料結構
interface ApiCannedFoodResponse {
  id: number;
  brandName: string;
  productName: string;
  imageUrl?: string;
  nutrition: {
    calories?: NutritionValue;
    protein?: NutritionValue;
    fat?: NutritionValue;
    fiber?: NutritionValue;
    ash?: NutritionValue;
    moisture?: NutritionValue;
    phosphorus?: NutritionValue;
    calcium?: NutritionValue;
    sodium?: NutritionValue;
    magnesium?: NutritionValue;
    potassium?: NutritionValue;
  };
  rawResponse?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 將 API 回傳的 nested 結構轉換成 flat 的 CannedFood 類型
 */
function transformApiResponse(data: ApiCannedFoodResponse): CannedFood {
  const nutrition = data.nutrition || {};

  return {
    id: data.id,
    brandName: data.brandName,
    productName: data.productName,
    imageUrl: data.imageUrl,
    nutritionFormat: "percentage", // API 回傳的是百分比格式
    calories: nutrition.calories?.value ?? undefined,
    protein: nutrition.protein?.value ?? undefined,
    fat: nutrition.fat?.value ?? undefined,
    fiber: nutrition.fiber?.value ?? undefined,
    ash: nutrition.ash?.value ?? undefined,
    moisture: nutrition.moisture?.value ?? undefined,
    phosphorus: nutrition.phosphorus?.value ?? undefined,
    calcium: nutrition.calcium?.value ?? undefined,
    sodium: nutrition.sodium?.value ?? undefined,
    magnesium: nutrition.magnesium?.value ?? undefined,
    potassium: nutrition.potassium?.value ?? undefined,
    rawResponse: data.rawResponse,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getCannedFoods(
  params: QueryParams = {}
): Promise<PaginatedResponse<CannedFood>> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.brandName) searchParams.set("brandName", params.brandName);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch canned foods");
  }

  const data: PaginatedResponse<ApiCannedFoodResponse> = await response.json();
  return {
    ...data,
    items: data.items.map(transformApiResponse),
  };
}

export async function getCannedFood(id: number): Promise<CannedFood> {
  const response = await fetch(`${API_BASE_URL}/api/canned-foods/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch canned food");
  }

  const data: ApiCannedFoodResponse = await response.json();
  return transformApiResponse(data);
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
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to analyze image");
  }

  const result: { success: boolean; data: ApiCannedFoodResponse } =
    await response.json();
  return {
    success: result.success,
    data: transformApiResponse(result.data),
  };
}

export async function deleteCannedFood(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/canned-foods/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete canned food");
  }
}

export function getImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}
