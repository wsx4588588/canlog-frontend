"use client";

import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { CannedFood, SortField, SortOrder } from "@/lib/types";
import {
  SortField as SortFieldEnum,
  SortOrder as SortOrderEnum,
} from "@/lib/types";

interface SortableColumn {
  key: SortField;
  label: string;
  format?: (value: number | null | undefined) => string;
}

interface CannedFoodTableProps {
  items: CannedFood[];
  sortBy?: SortField;
  sortOrder?: SortOrder;
  onSort: (field: SortField) => void;
}

const columns: SortableColumn[] = [
  {
    key: SortFieldEnum.PROTEIN,
    label: "蛋白質(%)",
    format: (v) => (v != null ? v.toFixed(1) : "-"),
  },
  {
    key: SortFieldEnum.FAT,
    label: "脂肪(%)",
    format: (v) => (v != null ? v.toFixed(1) : "-"),
  },
  {
    key: SortFieldEnum.PHOSPHORUS_PER_100KCAL,
    label: "磷(mg/100kcal)",
    format: (v) => (v != null ? v.toFixed(0) : "-"),
  },
  {
    key: SortFieldEnum.CALCIUM_PHOSPHORUS_RATIO,
    label: "鈣磷比",
    format: (v) => (v != null ? v.toFixed(2) : "-"),
  },
  {
    key: SortFieldEnum.CALORIES,
    label: "熱量(kcal/100g)",
    format: (v) => (v != null ? v.toFixed(1) : "-"),
  },
];

export function CannedFoodTable({
  items,
  sortBy,
  sortOrder,
  onSort,
}: CannedFoodTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortOrder === SortOrderEnum.ASC ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const getValue = (
    item: CannedFood,
    key: SortField
  ): number | null | undefined => {
    switch (key) {
      case SortFieldEnum.PROTEIN:
        return item.protein;
      case SortFieldEnum.FAT:
        return item.fat;
      case SortFieldEnum.PHOSPHORUS_PER_100KCAL:
        return item.phosphorusPer100kcal;
      case SortFieldEnum.CALCIUM_PHOSPHORUS_RATIO:
        return item.calciumPhosphorusRatio;
      case SortFieldEnum.CALORIES:
        return item.calories;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">品牌</TableHead>
            <TableHead className="min-w-[180px]">產品名稱</TableHead>
            {columns.map((col) => (
              <TableHead key={col.key} className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  {getSortIcon(col.key)}
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link
                  href={`/canned-foods/${item.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {item.brandName}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/canned-foods/${item.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {item.productName}
                </Link>
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} className="text-right tabular-nums">
                  {col.format
                    ? col.format(getValue(item, col.key))
                    : getValue(item, col.key) ?? "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
