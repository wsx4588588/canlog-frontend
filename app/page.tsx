"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCannedFoods, getImageUrl } from "@/lib/api";
import type { CannedFood, PaginatedResponse } from "@/lib/types";

export default function HomePage() {
  const [data, setData] = useState<PaginatedResponse<CannedFood> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(""); // 輸入框的值
  const [searchQuery, setSearchQuery] = useState(""); // 實際查詢的值
  const [page, setPage] = useState(1);
  const limit = 12;

  // 磷過濾狀態
  const [showFilter, setShowFilter] = useState(false);
  const [minPInput, setMinPInput] = useState("");
  const [maxPInput, setMaxPInput] = useState("");
  const [minPhosphorus, setMinPhosphorus] = useState<number | undefined>(
    undefined
  );
  const [maxPhosphorus, setMaxPhosphorus] = useState<number | undefined>(
    undefined
  );

  // 過濾是否啟用
  const isFilterActive =
    minPhosphorus !== undefined || maxPhosphorus !== undefined;

  // 用於追蹤當前查詢參數，避免不必要的頁數重置
  const prevQueryRef = useRef({ searchQuery, minPhosphorus, maxPhosphorus });

  // Fetch data - 依賴 searchQuery、過濾條件和 page
  useEffect(() => {
    const controller = new AbortController();

    // 檢查查詢參數是否變化，如果變化則重置頁數
    const prevQuery = prevQueryRef.current;
    if (
      prevQuery.searchQuery !== searchQuery ||
      prevQuery.minPhosphorus !== minPhosphorus ||
      prevQuery.maxPhosphorus !== maxPhosphorus
    ) {
      prevQueryRef.current = { searchQuery, minPhosphorus, maxPhosphorus };
      if (page !== 1) {
        setPage(1);
        return; // 讓下一次 effect 處理
      }
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getCannedFoods({
          search: searchQuery,
          minPhosphorusPer100kcal: minPhosphorus,
          maxPhosphorusPer100kcal: maxPhosphorus,
          page,
          limit,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch data:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [searchQuery, minPhosphorus, maxPhosphorus, page]);

  // 執行搜尋
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  // Enter 鍵搜尋
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 套用磷過濾
  const handleApplyFilter = () => {
    const minVal = minPInput ? parseFloat(minPInput) : undefined;
    const maxVal = maxPInput ? parseFloat(maxPInput) : undefined;
    setMinPhosphorus(isNaN(minVal as number) ? undefined : minVal);
    setMaxPhosphorus(isNaN(maxVal as number) ? undefined : maxVal);
  };

  // 清除磷過濾
  const handleClearFilter = () => {
    setMinPInput("");
    setMaxPInput("");
    setMinPhosphorus(undefined);
    setMaxPhosphorus(undefined);
  };

  // 過濾輸入框 Enter 鍵套用
  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApplyFilter();
    }
  };

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">罐頭列表</h1>
        <p className="text-muted-foreground">瀏覽已分析的寵物罐頭營養資訊</p>
      </div>

      {/* 搜尋欄和過濾 */}
      <div className="max-w-2xl mx-auto space-y-3 animate-fade-in animate-delay-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋品牌或產品名稱..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={showFilter ? "secondary" : "outline"}
            onClick={() => setShowFilter(!showFilter)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {isFilterActive && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full" />
            )}
          </Button>
        </div>

        {/* 磷過濾器 */}
        {showFilter && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-card">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              磷/100kcal (mg)
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最小"
                value={minPInput}
                onChange={(e) => setMinPInput(e.target.value)}
                onKeyDown={handleFilterKeyDown}
                className="w-24"
                min={0}
              />
              <span className="text-muted-foreground">~</span>
              <Input
                type="number"
                placeholder="最大"
                value={maxPInput}
                onChange={(e) => setMaxPInput(e.target.value)}
                onKeyDown={handleFilterKeyDown}
                className="w-24"
                min={0}
              />
            </div>
            <Button size="sm" onClick={handleApplyFilter}>
              套用
            </Button>
            {isFilterActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilter}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                清除
              </Button>
            )}
          </div>
        )}

        {/* 目前過濾條件 */}
        {isFilterActive && !showFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              磷: {minPhosphorus ?? 0} ~ {maxPhosphorus ?? "∞"} mg/100kcal
              <button
                onClick={handleClearFilter}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* 無資料 */}
      {!loading && data && data.items.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">
            尚無罐頭資料
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery ? "找不到符合的結果" : "點擊上方「上傳分析」開始添加"}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4">
              <Link href="/upload">上傳第一筆</Link>
            </Button>
          )}
        </div>
      )}

      {/* 罐頭列表 */}
      {!loading && data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((item, index) => (
              <Link
                key={item.id}
                href={`/canned-foods/${item.id}`}
                className="block animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="h-full overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  {/* 圖片 */}
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.brandName}
                        </p>
                      </div>

                      {/* 營養摘要 - 直接使用計算後的欄位 */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.protein != null && (
                          <Badge variant="outline" className="text-xs">
                            蛋白質 {item.protein.toFixed(1)}%
                          </Badge>
                        )}
                        {item.phosphorusPer100kcal != null && (
                          <Badge variant="outline" className="text-xs">
                            磷 {item.phosphorusPer100kcal.toFixed(0)}mg/100kcal
                          </Badge>
                        )}
                        {item.calciumPhosphorusRatio != null && (
                          <Badge variant="secondary" className="text-xs">
                            Ca:P {item.calciumPhosphorusRatio.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 分頁 */}
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-4">
                <span className="text-sm text-muted-foreground">
                  第 {page} 頁，共 {data.meta.totalPages} 頁
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPage((p) => Math.min(data.meta.totalPages, p + 1))
                }
                disabled={page === data.meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
