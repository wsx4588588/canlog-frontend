"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Beaker, Droplets, Flame, Leaf, Scale } from "lucide-react";
import type { CannedFood, NutritionValue } from "@/lib/types";

interface NutritionDisplayProps {
  cannedFood: CannedFood;
  showDryMatter?: boolean;
}

export function NutritionDisplay({
  cannedFood,
  showDryMatter = true,
}: NutritionDisplayProps) {
  const { nutrition } = cannedFood;

  const formatValue = (nv: NutritionValue | undefined, unit: string = "%") => {
    if (!nv || nv.value === undefined || nv.value === null) return "-";
    return `${nv.value.toFixed(2)}${unit}`;
  };

  const getValue = (nv: NutritionValue | undefined): number | null => {
    return nv?.value ?? null;
  };

  // 使用計算後的欄位顯示 mg/100kcal
  const formatMgPer100kcal = (value: number | null | undefined): string => {
    if (value == null) return "-";
    return `${value.toFixed(1)} mg`;
  };

  // 基本營養素從原始資料取得（用於顯示詳細信息）
  const basicNutrients = nutrition
    ? [
        {
          label: "蛋白質",
          value: nutrition.protein,
          icon: Flame,
          color: "bg-red-500",
        },
        {
          label: "脂肪",
          value: nutrition.fat,
          icon: Droplets,
          color: "bg-amber-500",
        },
        {
          label: "纖維",
          value: nutrition.fiber,
          icon: Leaf,
          color: "bg-green-500",
        },
        {
          label: "灰分",
          value: nutrition.ash,
          icon: Beaker,
          color: "bg-gray-500",
        },
        {
          label: "水分",
          value: nutrition.moisture,
          icon: Droplets,
          color: "bg-blue-500",
        },
      ]
    : [];

  // 如果沒有原始 nutrition 資料，使用計算後的欄位
  const basicNutrientsFromCalc = [
    {
      label: "蛋白質",
      value: cannedFood.protein,
      icon: Flame,
      color: "bg-red-500",
    },
    {
      label: "脂肪",
      value: cannedFood.fat,
      icon: Droplets,
      color: "bg-amber-500",
    },
    {
      label: "纖維",
      value: cannedFood.fiber,
      icon: Leaf,
      color: "bg-green-500",
    },
    {
      label: "灰分",
      value: cannedFood.ash,
      icon: Beaker,
      color: "bg-gray-500",
    },
    {
      label: "水分",
      value: cannedFood.moisture,
      icon: Droplets,
      color: "bg-blue-500",
    },
  ];

  // 礦物質使用計算後的欄位
  const minerals = [
    { label: "磷", value: cannedFood.phosphorusPer100kcal },
    { label: "鈣", value: cannedFood.calciumPer100kcal },
  ];

  const caloriesValue = cannedFood.calories;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{cannedFood.productName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {cannedFood.brandName}
            </p>
          </div>
          {caloriesValue && (
            <Badge variant="secondary">
              {caloriesValue.toFixed(1)} kcal/100g
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本營養素 */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            基本營養成分
          </h4>
          <div className="space-y-3">
            {nutrition && basicNutrients.length > 0
              ? basicNutrients.map((nutrient) => {
                  const Icon = nutrient.icon;
                  const percentage = getValue(nutrient.value) ?? 0;
                  return (
                    <div key={nutrient.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{nutrient.label}</span>
                        </div>
                        <span className="font-medium">
                          {formatValue(nutrient.value)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                      />
                    </div>
                  );
                })
              : basicNutrientsFromCalc.map((nutrient) => {
                  const Icon = nutrient.icon;
                  const percentage = nutrient.value ?? 0;
                  return (
                    <div key={nutrient.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{nutrient.label}</span>
                        </div>
                        <span className="font-medium">
                          {nutrient.value != null
                            ? `${nutrient.value.toFixed(2)}%`
                            : "-"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                      />
                    </div>
                  );
                })}
          </div>
        </div>

        <Separator />

        {/* 礦物質 - 使用計算後的 mg/100kcal */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            礦物質成分 (mg/100kcal)
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {minerals.map((mineral) => (
              <div
                key={mineral.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm text-muted-foreground">
                  {mineral.label}
                </span>
                <span className="font-medium text-sm">
                  {formatMgPer100kcal(mineral.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 鈣磷比 */}
        {showDryMatter && cannedFood.calciumPhosphorusRatio != null && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-muted-foreground">
                  關鍵指標
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">磷/100kcal</p>
                  <p className="text-lg font-bold text-primary">
                    {cannedFood.phosphorusPer100kcal?.toFixed(1) ?? "-"} mg
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-xs text-muted-foreground">鈣磷比</p>
                  <p className="text-lg font-bold text-accent">
                    {cannedFood.calciumPhosphorusRatio.toFixed(2)} : 1
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
