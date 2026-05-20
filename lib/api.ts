import { API_BASE_URL } from "./utils";
import type {
  CannedFood,
  PaginatedResponse,
  AnalyzeResponse,
  SortField,
  SortOrder,
  Dish,
  Order,
  CreateDishInput,
  UpdateDishInput,
  CreateOrderInput,
  MenuAnalysisResult,
  OrderAnalysisResult,
  Cat,
  FeedingRecord,
  CreateCatInput,
  CreateFeedingRecordInput,
  UpdateFeedingRecordInput,
} from "./types";

interface QueryParams {
  search?: string;
  brandName?: string;
  minPhosphorusPer100kcal?: number;
  maxPhosphorusPer100kcal?: number;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
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
  if (queryParams.sortBy) searchParams.set("sortBy", queryParams.sortBy);
  if (queryParams.sortOrder)
    searchParams.set("sortOrder", queryParams.sortOrder);

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

// ========== 罐頭收藏 API ==========

export async function addFavorite(cannedFoodId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods/${cannedFoodId}/favorite`,
    {
      method: "POST",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to add favorite");
  }
}

export async function removeFavorite(cannedFoodId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods/${cannedFoodId}/favorite`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to remove favorite");
  }
}

export async function checkFavorites(
  ids: number[]
): Promise<Record<number, boolean>> {
  if (ids.length === 0) return {};
  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods/favorites/check?ids=${ids.join(",")}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to check favorites");
  }
  return response.json();
}

export async function getMyFavorites(
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<CannedFood>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/canned-foods/my-favorites${query ? `?${query}` : ""}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }
  return response.json();
}

// ========== 年菜料理 API ==========

export async function getDishes(activeOnly?: boolean): Promise<Dish[]> {
  const params = activeOnly ? "?activeOnly=true" : "";
  const response = await fetch(`${API_BASE_URL}/api/dishes${params}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch dishes");
  }
  return response.json();
}

export async function createDish(data: CreateDishInput): Promise<Dish> {
  const response = await fetch(`${API_BASE_URL}/api/dishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to create dish");
  }
  return response.json();
}

export async function updateDish(id: number, data: UpdateDishInput): Promise<Dish> {
  const response = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to update dish");
  }
  return response.json();
}

export async function deleteDish(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/dishes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete dish");
  }
}

// ========== 年菜訂單 API ==========

export async function getOrders(status?: string, search?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/orders${queryString ? `?${queryString}` : ""}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
}

export async function getOrder(id: number): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch order");
  }
  return response.json();
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to create order");
  }
  return response.json();
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to update order status");
  }
  return response.json();
}

export async function deleteOrder(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to delete order");
  }
}

// ========== AI 圖片分析 API ==========

export async function analyzeMenuImage(file: File): Promise<MenuAnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/dishes/analyze-menu`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "菜單分析失敗");
  }
  return response.json();
}

export async function analyzeOrderImage(file: File): Promise<OrderAnalysisResult> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/orders/analyze-order`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "訂單分析失敗");
  }
  return response.json();
}

// ========== 罐罐筆記 API ==========

export async function uploadCatAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${API_BASE_URL}/api/cats/upload-avatar`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "上傳失敗");
  }
  const data = await response.json();
  return data.url;
}

export async function getCats(): Promise<Cat[]> {
  const response = await fetch(`${API_BASE_URL}/api/cats`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch cats");
  return response.json();
}

export async function createCat(data: CreateCatInput): Promise<Cat> {
  const response = await fetch(`${API_BASE_URL}/api/cats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to create cat");
  }
  return response.json();
}

export async function updateCat(
  id: number,
  data: Partial<CreateCatInput>
): Promise<Cat> {
  const response = await fetch(`${API_BASE_URL}/api/cats/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to update cat");
  }
  return response.json();
}

export async function deleteCat(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cats/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete cat");
}

export async function getFeedingRecords(
  catId: number,
  params?: { cannedFoodId?: number; page?: number; limit?: number }
): Promise<PaginatedResponse<FeedingRecord>> {
  const searchParams = new URLSearchParams();
  if (params?.cannedFoodId)
    searchParams.set("cannedFoodId", params.cannedFoodId.toString());
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/cats/${catId}/feeding-records${query ? `?${query}` : ""}`,
    { credentials: "include" }
  );
  if (!response.ok) throw new Error("Failed to fetch feeding records");
  return response.json();
}

export async function createFeedingRecord(
  catId: number,
  data: CreateFeedingRecordInput
): Promise<FeedingRecord> {
  const response = await fetch(
    `${API_BASE_URL}/api/cats/${catId}/feeding-records`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to create feeding record");
  }
  return response.json();
}

export async function updateFeedingRecord(
  catId: number,
  id: number,
  data: UpdateFeedingRecordInput
): Promise<FeedingRecord> {
  const response = await fetch(
    `${API_BASE_URL}/api/cats/${catId}/feeding-records/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "Failed to update feeding record");
  }
  return response.json();
}

export async function deleteFeedingRecord(
  catId: number,
  id: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/cats/${catId}/feeding-records/${id}`,
    { method: "DELETE", credentials: "include" }
  );
  if (!response.ok) throw new Error("Failed to delete feeding record");
}

export async function batchCreateDishes(
  dishes: CreateDishInput[],
): Promise<Dish[]> {
  const response = await fetch(`${API_BASE_URL}/api/dishes/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dishes }),
    credentials: "include",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || "批次建立料理失敗");
  }
  return response.json();
}
