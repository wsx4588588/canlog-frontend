// 排序欄位枚舉
export enum SortField {
  PROTEIN = "protein",
  FAT = "fat",
  PHOSPHORUS_PER_100KCAL = "phosphorusPer100kcal",
  CALCIUM_PHOSPHORUS_RATIO = "calciumPhosphorusRatio",
  CALORIES = "calories",
  CREATED_AT = "createdAt",
}

// 排序方向枚舉
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

// 視圖模式
export type ViewMode = "card" | "table";

// 營養素值結構（原始資料）
export interface NutritionValue {
  value: number | null;
  unit: string | null;
}

// 營養資訊結構（對應 API 回傳的原始資料）
export interface Nutrition {
  protein?: NutritionValue;
  fat?: NutritionValue;
  fiber?: NutritionValue;
  ash?: NutritionValue;
  moisture?: NutritionValue;
  calories?: NutritionValue;
  phosphorus?: NutritionValue;
  calcium?: NutritionValue;
  sodium?: NutritionValue;
  magnesium?: NutritionValue;
  potassium?: NutritionValue;
}

export interface CannedFood {
  id: number;
  brandName: string;
  productName: string;
  imageUrl?: string | null;

  // 計算後的營養欄位（用於列表顯示）
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  moisture?: number | null;
  fiber?: number | null;
  ash?: number | null;
  phosphorusPer100kcal?: number | null;
  calciumPer100kcal?: number | null;
  calciumPhosphorusRatio?: number | null;

  // 原始資料（備份用）
  nutrition?: Nutrition | null;

  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface AnalyzeResponse {
  success: boolean;
  data: CannedFood;
}

// ========== 年菜管理系統 ==========

export enum OrderStatus {
  NOT_PICKED_UP = "NOT_PICKED_UP",
  PICKED_UP = "PICKED_UP",
  CANCELLED = "CANCELLED",
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  dishId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  pickupTime: string;
  note?: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishInput {
  name: string;
  price: number;
  stock?: number;
  isActive?: boolean;
}

export interface UpdateDishInput {
  name?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface CreateOrderItemInput {
  dishId: number;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  note?: string;
  items: CreateOrderItemInput[];
}

// ========== AI 分析結果 ==========

export interface MenuAnalysisResult {
  dishes: { name: string; price: number }[];
}

export interface OrderAnalysisResult {
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  note: string;
  totalAmount: number;
  items: { dishName: string; quantity: number }[];
}
