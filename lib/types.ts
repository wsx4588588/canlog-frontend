export interface DryMatterRatios {
  protein: number;
  fat: number;
  fiber: number;
  phosphorus: number;
  calcium: number;
  calciumPhosphorusRatio: number;
}

export interface CannedFood {
  id: number;
  brandName: string;
  productName: string;
  imageUrl?: string;
  nutritionFormat: "per_100g" | "percentage";
  calories?: number; // kcal/100g
  protein?: number;
  fat?: number;
  fiber?: number;
  ash?: number;
  moisture?: number;
  phosphorus?: number;
  calcium?: number;
  sodium?: number;
  magnesium?: number;
  potassium?: number;
  dryMatterRatios?: DryMatterRatios;
  rawResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyzeResponse {
  success: boolean;
  data: CannedFood;
}
