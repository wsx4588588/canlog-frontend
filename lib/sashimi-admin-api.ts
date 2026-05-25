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
): Promise<{ date: string; sourceDate: string; items: InventoryRow[] }> {
  return fetchJson(`${BASE}/inventory/${date}/copy-from-previous`, {
    method: "POST",
  });
}

// ====== Orders ======

export type OrderStatus = "待確認" | "製作中" | "已完成" | "已取消";
export type PaymentStatus = "未付" | "已付";

export interface OrderSummary {
  id: number;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  lineUserId: string;
  itemsSummary: string;
  totalAmount: number;
  pickupMethod: string;
  pickupTime: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  source: string;
}

export interface OrderDetail extends OrderSummary {
  address: string;
  paymentMethod: string;
  note: string;
  items: {
    productId: number;
    sku: string;
    productName: string;
    unitPrice: number;
    qty: number;
  }[];
}

export interface OrdersListResponse {
  items: OrderSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listOrders(params: {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersListResponse> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return fetchJson<OrdersListResponse>(`${BASE}/orders${suffix}`);
}

export async function getOrder(id: number): Promise<OrderDetail> {
  return fetchJson<OrderDetail>(`${BASE}/orders/${id}`);
}

export async function updateOrder(
  id: number,
  patch: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    note?: string;
  }
): Promise<OrderDetail> {
  return fetchJson<OrderDetail>(`${BASE}/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export interface CreateManualOrderInput {
  customerId: number;
  displayName?: string;
  customerPhone?: string;
  items: { productId: string; qty: number }[];
  pickupMethod: "自取" | "外送";
  pickupTime: string;
  address?: string;
  note?: string;
}

export async function createManualOrder(
  input: CreateManualOrderInput
): Promise<{ orderId: string; totalAmount: number }> {
  return fetchJson(`${BASE}/orders`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ====== Customers ======

export interface CustomerSummary {
  id: number;
  displayName: string;
  phone: string;
  defaultAddress: string;
  lineUserId: string;
  orderCount: number;
  lastOrderAt: string;
  source: string;
}

export interface CreateCustomerInput {
  displayName: string;
  phone: string;
  defaultAddress?: string;
  nickname?: string;
  note?: string;
}

export async function searchCustomers(q: string): Promise<CustomerSummary[]> {
  const data = await fetchJson<{ items: CustomerSummary[] }>(
    `${BASE}/customers/search?q=${encodeURIComponent(q)}`
  );
  return data.items;
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<CustomerSummary> {
  return fetchJson(`${BASE}/customers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
