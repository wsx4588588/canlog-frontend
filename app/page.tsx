'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCannedFoods, getImageUrl } from '@/lib/api';
import type { CannedFood, PaginatedResponse } from '@/lib/types';

export default function HomePage() {
  const [data, setData] = useState<PaginatedResponse<CannedFood> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCannedFoods({ search, page, limit });
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">罐頭列表</h1>
        <p className="text-muted-foreground">
          瀏覽已分析的寵物罐頭營養資訊
        </p>
      </div>

      {/* 搜尋欄 */}
      <div className="max-w-md mx-auto animate-fade-in animate-delay-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋品牌或產品名稱..."
            value={search}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
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
          <h3 className="text-lg font-medium text-muted-foreground">尚無罐頭資料</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search ? '找不到符合的結果' : '點擊上方「上傳分析」開始添加'}
          </p>
          {!search && (
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
                        <p className="text-sm text-muted-foreground">{item.brandName}</p>
                      </div>

                      {/* 營養摘要 */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.protein !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            蛋白質 {item.protein.toFixed(1)}%
                          </Badge>
                        )}
                        {item.dryMatterRatios?.calciumPhosphorusRatio !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            Ca:P {item.dryMatterRatios.calciumPhosphorusRatio.toFixed(2)}
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
          {data.totalPages > 1 && (
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
                  第 {page} 頁，共 {data.totalPages} 頁
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
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

