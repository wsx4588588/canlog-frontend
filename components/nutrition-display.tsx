"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Beaker, Droplets, Flame, Leaf, Scale } from "lucide-react";
import type { CannedFood } from "@/lib/types";

interface NutritionDisplayProps {
  cannedFood: CannedFood;
  showDryMatter?: boolean;
}

export function NutritionDisplay({
  cannedFood,
  showDryMatter = true,
}: NutritionDisplayProps) {
  const formatValue = (value: number | undefined, unit: string = "%") => {
    if (value === undefined || value === null) return "-";
    return `${value.toFixed(2)}${unit}`;
  };

  const formatMg = (value: number | undefined) => {
    if (value === undefined || value === null) return "-";
    return `${value.toFixed(1)} mg`;
  };

  /**
   * 計算礦物質的 mg/100kcal
   * 公式：
   * 1. 100kcal 需要的罐頭克數 = 100 / calories_per_100g * 100
   * 2. 該克數中的礦物質含量(mg) = (percentage / 100) * grams * 1000
   * 簡化後：mg_per_100kcal = percentage * 100000 / calories_per_100g
   */
  const calculateMgPer100kcal = (
    percentageValue: number | undefined,
    caloriesPer100g: number | undefined
  ): number | undefined => {
    if (
      percentageValue === undefined ||
      percentageValue === null ||
      caloriesPer100g === undefined ||
      caloriesPer100g === null ||
      caloriesPer100g === 0
    ) {
      return undefined;
    }
    return (percentageValue * 100000) / caloriesPer100g;
  };

  const formatMgPer100kcal = (
    percentageValue: number | undefined,
    caloriesPer100g: number | undefined
  ): string => {
    const mgValue = calculateMgPer100kcal(percentageValue, caloriesPer100g);
    if (mgValue === undefined) return "-";
    return `${mgValue.toFixed(1)} mg`;
  };

  const basicNutrients = [
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

  const minerals = [
    { label: "磷", value: cannedFood.phosphorus },
    { label: "鈣", value: cannedFood.calcium },
    { label: "鈉", value: cannedFood.sodium },
    { label: "鎂", value: cannedFood.magnesium },
    { label: "鉀", value: cannedFood.potassium },
  ];

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
          <Badge
            variant={
              cannedFood.nutritionFormat === "per_100g"
                ? "default"
                : "secondary"
            }
          >
            {cannedFood.nutritionFormat === "per_100g" ? "每100g" : "百分比"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本營養素 */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            基本營養成分
          </h4>
          <div className="space-y-3">
            {basicNutrients.map((nutrient) => {
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
                      {formatValue(nutrient.value)}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* 礦物質 */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            礦物質成分 (mg/100kcal)
          </h4>
          {cannedFood.calories && (
            <p className="text-xs text-muted-foreground mb-2">
              熱量: {cannedFood.calories.toFixed(1)} kcal/100g
            </p>
          )}
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
                  {formatMgPer100kcal(mineral.value, cannedFood.calories)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 乾物質比例 */}
        {showDryMatter && cannedFood.dryMatterRatios && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-muted-foreground">
                  乾物質基礎 (Dry Matter)
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">蛋白質 (DM)</p>
                  <p className="text-lg font-bold text-primary">
                    {cannedFood.dryMatterRatios.protein.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">脂肪 (DM)</p>
                  <p className="text-lg font-bold text-amber-600">
                    {cannedFood.dryMatterRatios.fat.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <p className="text-xs text-muted-foreground">鈣磷比</p>
                  <p className="text-lg font-bold text-accent">
                    {cannedFood.dryMatterRatios.calciumPhosphorusRatio.toFixed(
                      2
                    )}{" "}
                    : 1
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">磷 (DM)</p>
                  <p className="text-lg font-bold">
                    {cannedFood.dryMatterRatios.phosphorus.toFixed(1)} mg
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
