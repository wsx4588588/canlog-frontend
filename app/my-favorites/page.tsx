"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyFavorites, removeFavorite, getImageUrl } from "@/lib/api";
import type { CannedFood, PaginatedResponse } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

export default function MyFavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<PaginatedResponse<CannedFood> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyFavorites({ page, limit });
      setData(result);
    } catch {
      console.error("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading, fetchData, router]);

  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    cannedFoodId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await removeFavorite(cannedFoodId);
      // 重新載入資料
      if (data) {
        const newItems = data.items.filter((item) => item.id !== cannedFoodId);
        if (newItems.length === 0 && page > 1) {
          setPage(page - 1);
        } else {
          await fetchData();
        }
      }
    } catch {
      // 忽略錯誤
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          我的收藏
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          收藏的罐頭列表
        </p>
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* 無資料 */}
      {!loading && data && data.items.length === 0 && (
        <div className="text-center py-12 sm:py-20 animate-fade-in">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">
            還沒有收藏的罐頭
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            瀏覽罐頭列表，點擊愛心按鈕收藏
          </p>
          <Button asChild className="mt-4">
            <Link href="/">瀏覽罐頭</Link>
          </Button>
        </div>
      )}

      {/* 收藏列表 */}
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
                <Card className="h-full overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative">
                  {/* 取消收藏按鈕 */}
                  <button
                    onClick={(e) => handleRemoveFavorite(e, item.id)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="取消收藏"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
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

                      {/* 營養摘要 */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.protein != null && (
                          <Badge variant="outline" className="text-xs">
                            蛋白質 {item.protein.toFixed(1)}%
                          </Badge>
                        )}
                        {item.phosphorusPer100kcal != null && (
                          <Badge variant="outline" className="text-xs">
                            磷 {item.phosphorusPer100kcal.toFixed(0)}
                            mg/100kcal
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
