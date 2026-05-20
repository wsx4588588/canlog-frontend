import { API_BASE_URL } from "./utils";

const BASE = `${API_BASE_URL}/api/sashimi/admin`;

// ====== Types ======

export interface SashimiProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  imageUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  category: string;
  unit: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface InventoryRow {
  productId: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  inventory: {
    isAvailable: boolean;
    todayPrice: number;
    stockQty: number;
    dailyNote: string;
  } | null;
}

export interface UpsertInventoryItem {
  productId: number;
  isAvailable: boolean;
  todayPrice: number;
  stockQty: number;
  dailyNote?: string;
}

// ====== Helpers ======

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message)
      ? body.message.join("、")
      : body.message;
    throw new Error(msg ?? `Request failed (${res.status})`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ====== Products ======

export async function listProducts(includeInactive = false): Promise<SashimiProduct[]> {
  const qs = includeInactive ? "?includeInactive=true" : "";
  const data = await fetchJson<{ items: SashimiProduct[] }>(`${BASE}/products${qs}`);
  return data.items;
}

export async function createProduct(
  input: CreateProductInput
): Promise<SashimiProduct> {
  return fetchJson<SashimiProduct>(`${BASE}/products`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput
): Promise<SashimiProduct> {
  return fetchJson<SashimiProduct>(`${BASE}/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function softDeleteProduct(id: number): Promise<SashimiProduct> {
  return fetchJson<SashimiProduct>(`${BASE}/products/${id}`, {
    method: "DELETE",
  });
}

// ====== Inventory ======

export async function listInventory(
  date: string
): Promise<{ date: string; items: InventoryRow[] }> {
  return fetchJson(`${BASE}/inventory/${date}`);
}

export async function upsertInventory(
  date: string,
  items: UpsertInventoryItem[]
): Promise<{ date: string; items: InventoryRow[] }> {
  return fetchJson(`${BASE}/inventory/${date}`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function copyInventoryFromPrevious(
  date: string
): Promise<{ date: string; items: InventoryRow[] }> {
  return fetchJson(`${BASE}/inventory/${date}/copy-from-previous`, {
    method: "POST",
  });
}
