"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCannedFoods, getMyFavorites } from "@/lib/api";
import type { CannedFood } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CannedFoodPickerProps {
  value: CannedFood | null;
  onChange: (food: CannedFood | null) => void;
}

export function CannedFoodPicker({ value, onChange }: CannedFoodPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CannedFood[]>([]);
  const [favorites, setFavorites] = useState<CannedFood[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favLoaded, setFavLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 載入收藏清單（一次性）
  useEffect(() => {
    let cancelled = false;
    getMyFavorites({ limit: 20 })
      .then((res) => {
        if (!cancelled) {
          setFavorites(res.items);
          setFavLoaded(true);
        }
      })
      .catch(() => {
        // 未登入或失敗，靜默處理
        if (!cancelled) setFavLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  // 搜尋
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getCannedFoods({ search: query, limit: 8 });
        setResults(res.items);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // 點外面關閉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (food: CannedFood) => {
    onChange(food);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  const isSearching = query.trim().length > 0;
  const showFavorites = !isSearching && favorites.length > 0;

  // 已選取 → 顯示選取結果卡片
  if (value) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/40">
        {value.imageUrl ? (
          <img
            src={value.imageUrl}
            alt={value.productName}
            className="w-10 h-10 object-cover rounded border shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded border bg-muted shrink-0 flex items-center justify-center text-lg">
            🥫
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{value.brandName}</p>
          <p className="text-xs text-muted-foreground truncate">{value.productName}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0 px-1"
        >
          更換
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="搜尋品牌或品名..."
      />

      {open && (showFavorites || isSearching || loading) && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border bg-card shadow-lg max-h-64 overflow-y-auto">
          {/* 收藏快選（無搜尋時顯示） */}
          {showFavorites && (
            <>
              <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                <span className="text-xs font-medium text-muted-foreground">我的收藏</span>
              </div>
              {favorites.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelect(food)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left",
                    "hover:bg-muted transition-colors"
                  )}
                >
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt={food.productName}
                      className="w-9 h-9 object-cover rounded border shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded border bg-muted shrink-0 flex items-center justify-center text-base">
                      🥫
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{food.brandName}</p>
                    <p className="text-xs text-muted-foreground truncate">{food.productName}</p>
                  </div>
                </button>
              ))}
              {favLoaded && (
                <p className="text-xs text-muted-foreground px-3 py-1.5 border-t">
                  或輸入關鍵字搜尋更多罐頭
                </p>
              )}
            </>
          )}

          {/* 搜尋結果 */}
          {isSearching && (
            <>
              {loading && (
                <p className="text-sm text-muted-foreground px-3 py-2">搜尋中...</p>
              )}
              {!loading && results.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">找不到符合的罐頭</p>
              )}
              {results.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleSelect(food)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left",
                    "hover:bg-muted transition-colors"
                  )}
                >
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt={food.productName}
                      className="w-9 h-9 object-cover rounded border shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded border bg-muted shrink-0 flex items-center justify-center text-base">
                      🥫
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{food.brandName}</p>
                    <p className="text-xs text-muted-foreground truncate">{food.productName}</p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* 無收藏也無搜尋時的提示 */}
          {!showFavorites && !isSearching && favLoaded && (
            <p className="text-sm text-muted-foreground px-3 py-2">輸入關鍵字搜尋罐頭</p>
          )}
        </div>
      )}
    </div>
  );
}
