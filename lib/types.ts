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
