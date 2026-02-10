"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldAlert,
  UtensilsCrossed,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getDishes,
  createDish,
  updateDish,
  deleteDish,
  analyzeMenuImage,
  batchCreateDishes,
} from "@/lib/api";
import type { Dish, CreateDishInput } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

interface AiDishRow {
  name: string;
  price: string;
  stock: string;
}

export default function DishesPage() {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // 表單狀態
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI 匯入狀態
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<AiDishRow[]>([]);
  const [aiSubmitting, setAiSubmitting] = useState(false);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const data = await getDishes();
      setDishes(data);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDishes();
    }
  }, [isAdmin]);

  const openCreateDialog = () => {
    setEditingDish(null);
    setFormName("");
    setFormPrice("");
    setFormStock("0");
    setDialogOpen(true);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormPrice(dish.price.toString());
    setFormStock(dish.stock.toString());
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice) return;

    setSubmitting(true);
    try {
      if (editingDish) {
        await updateDish(editingDish.id, {
          name: formName.trim(),
          price: parseInt(formPrice, 10),
          stock: parseInt(formStock || "0", 10),
        });
      } else {
        await createDish({
          name: formName.trim(),
          price: parseInt(formPrice, 10),
          stock: parseInt(formStock || "0", 10),
        });
      }
      setDialogOpen(false);
      await fetchDishes();
    } catch (error) {
      alert(error instanceof Error ? error.message : "操作失敗");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dish: Dish) => {
    if (!confirm(`確定要刪除「${dish.name}」嗎？`)) return;
    try {
      await deleteDish(dish.id);
      await fetchDishes();
    } catch {
      alert("刪除失敗");
    }
  };

  const handleStockChange = async (dish: Dish, delta: number) => {
    const newStock = dish.stock + delta;
    if (newStock < 0) return;
    try {
      await updateDish(dish.id, { stock: newStock });
      await fetchDishes();
    } catch {
      alert("更新庫存失敗");
    }
  };

  const handleToggleActive = async (dish: Dish) => {
    try {
      await updateDish(dish.id, { isActive: !dish.isActive });
      await fetchDishes();
    } catch {
      alert("更新狀態失敗");
    }
  };

  // ===== AI 匯入相關 =====

  const openAiDialog = () => {
    setAiFile(null);
    setAiPreview(null);
    setAiAnalyzing(false);
    setAiResults([]);
    setAiSubmitting(false);
    setAiDialogOpen(true);
  };

  const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiFile(file);
      setAiPreview(URL.createObjectURL(file));
      setAiResults([]);
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiFile) return;
    setAiAnalyzing(true);
    try {
      const result = await analyzeMenuImage(aiFile);
      setAiResults(
        result.dishes.map((d) => ({
          name: d.name,
          price: d.price.toString(),
          stock: "0",
        })),
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "菜單分析失敗");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const updateAiRow = (index: number, field: keyof AiDishRow, value: string) => {
    const updated = [...aiResults];
    updated[index] = { ...updated[index], [field]: value };
    setAiResults(updated);
  };

  const removeAiRow = (index: number) => {
    setAiResults(aiResults.filter((_, i) => i !== index));
  };

  const addAiRow = () => {
    setAiResults([...aiResults, { name: "", price: "", stock: "0" }]);
  };

  const handleAiConfirm = async () => {
    const validDishes: CreateDishInput[] = aiResults
      .filter((r) => r.name.trim() && r.price)
      .map((r) => ({
        name: r.name.trim(),
        price: parseInt(r.price, 10),
        stock: parseInt(r.stock || "0", 10),
      }));

    if (validDishes.length === 0) {
      alert("請至少保留一道料理");
      return;
    }

    setAiSubmitting(true);
    try {
      await batchCreateDishes(validDishes);
      setAiDialogOpen(false);
      await fetchDishes();
    } catch (error) {
      alert(error instanceof Error ? error.message : "批次建立失敗");
    } finally {
      setAiSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12 sm:py-20">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">權限不足</h1>
          <p className="text-muted-foreground">此功能僅限管理員使用</p>
        </div>
        <Button asChild>
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">年菜料理管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理年菜品項、售價與庫存</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openAiDialog}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI 匯入菜單
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            新增料理
          </Button>
        </div>
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* 無資料 */}
      {!loading && dishes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">尚無料理</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">點擊「新增料理」或「AI 匯入菜單」開始添加</p>
        </div>
      )}

      {/* 料理列表 */}
      {!loading && dishes.length > 0 && (
        <div className="grid gap-3">
          {dishes.map((dish) => (
            <Card
              key={dish.id}
              className={`transition-all ${!dish.isActive ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4 space-y-3">
                {/* 第一行：名稱 + 價格 + 操作 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{dish.name}</h3>
                      {!dish.isActive && (
                        <Badge variant="secondary" className="text-xs">已下架</Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary mt-0.5">
                      ${dish.price}
                      <span className="text-sm font-normal text-muted-foreground">/份</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant={dish.isActive ? "secondary" : "default"} size="sm"
                      onClick={() => handleToggleActive(dish)}>
                      {dish.isActive ? "下架" : "上架"}
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      onClick={() => openEditDialog(dish)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(dish)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 第二行：庫存控制 - 大按鈕，方便手機操作 */}
                <div className="flex items-center gap-3 bg-muted/40 rounded-lg p-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">庫存</span>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <Button
                      variant="outline"
                      className="h-10 w-14 text-base font-bold"
                      onClick={() => handleStockChange(dish, -1)}
                      disabled={dish.stock <= 0}
                    >
                      -1
                    </Button>
                    <span
                      className={`min-w-[3rem] text-center text-xl font-bold tabular-nums ${
                        dish.stock === 0 ? "text-destructive" : ""
                      }`}
                    >
                      {dish.stock}
                    </span>
                    <Button
                      variant="outline"
                      className="h-10 w-14 text-base font-bold"
                      onClick={() => handleStockChange(dish, 1)}
                    >
                      +1
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 px-3 text-sm"
                    onClick={() => handleStockChange(dish, 5)}
                  >
                    +5
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 新增/編輯 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDish ? "編輯料理" : "新增料理"}</DialogTitle>
            <DialogDescription>
              {editingDish ? "修改料理的名稱、售價或庫存" : "輸入新料理的名稱、售價和初始庫存"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">料理名稱</label>
              <Input placeholder="例：魚翅佛跳牆" value={formName}
                onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">售價（元）</label>
              <Input type="number" placeholder="例：1300" value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)} min={0} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">庫存量</label>
              <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-14 text-base font-bold"
                  onClick={() => setFormStock(String(Math.max(0, parseInt(formStock || "0", 10) - 1)))}
                  disabled={parseInt(formStock || "0", 10) <= 0}
                >
                  -1
                </Button>
                <span className="min-w-[3rem] text-center text-xl font-bold tabular-nums flex-1">
                  {formStock || "0"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-14 text-base font-bold"
                  onClick={() => setFormStock(String(parseInt(formStock || "0", 10) + 1))}
                >
                  +1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 px-3 text-sm"
                  onClick={() => setFormStock(String(parseInt(formStock || "0", 10) + 5))}
                >
                  +5
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={submitting || !formName.trim() || !formPrice}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingDish ? "儲存" : "新增"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 匯入菜單 Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 匯入菜單
            </DialogTitle>
            <DialogDescription>
              上傳菜單圖片，AI 將自動辨識料理名稱和售價，辨識後可修改再確認匯入
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 步驟一：上傳圖片 */}
            {aiResults.length === 0 && (
              <div className="space-y-3">
                <label
                  htmlFor="ai-menu-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                    aiPreview ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  {aiPreview ? (
                    <img src={aiPreview} alt="菜單預覽" className="max-h-48 rounded-lg object-contain" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">點擊上傳菜單圖片</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">支援 JPG, PNG, WEBP（最大 10MB）</p>
                    </>
                  )}
                  <input
                    id="ai-menu-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAiFileChange}
                  />
                </label>

                {aiFile && (
                  <Button className="w-full" onClick={handleAiAnalyze} disabled={aiAnalyzing}>
                    {aiAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        AI 分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        開始分析
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* 步驟二：可編輯結果卡片 */}
            {aiResults.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                  <p>名稱重複的料理將<span className="font-semibold text-foreground">更新價格</span>，不會重複建立。</p>
                  {aiResults.some((r) => dishes.some((d) => d.name === r.name.trim())) && (
                    <p className="text-yellow-600">
                      ⚠ 標有「已存在」的料理匯入後只會更新價格，庫存維持不變。
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    辨識到 {aiResults.length} 道料理，請確認或修改：
                  </p>
                  <Button variant="ghost" size="sm" onClick={addAiRow}>
                    <Plus className="h-3 w-3 mr-1" />
                    新增一列
                  </Button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {aiResults.map((row, index) => {
                    const isDuplicate = dishes.some((d) => d.name === row.name.trim());
                    return (
                    <div key={index} className={`border rounded-lg p-3 space-y-2 ${isDuplicate ? "border-yellow-400 bg-yellow-50/50" : "bg-background"}`}>
                      {/* 名稱 + 已存在標籤 + 刪除 */}
                      <div className="flex items-center gap-2">
                        <Input
                          value={row.name}
                          onChange={(e) => updateAiRow(index, "name", e.target.value)}
                          placeholder="料理名稱"
                          className="flex-1"
                        />
                        {isDuplicate && (
                          <Badge variant="outline" className="shrink-0 text-yellow-700 border-yellow-500 bg-yellow-100 text-xs">
                            已存在
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => removeAiRow(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* 售價 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground w-10 shrink-0">售價</span>
                        <Input
                          type="number"
                          value={row.price}
                          onChange={(e) => updateAiRow(index, "price", e.target.value)}
                          placeholder="0"
                          min={0}
                        />
                      </div>
                      {/* 庫存 - 按鈕形式 */}
                      <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                        <span className="text-sm text-muted-foreground w-10 shrink-0">庫存</span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-12 text-sm font-bold"
                          onClick={() => updateAiRow(index, "stock", String(Math.max(0, parseInt(row.stock || "0", 10) - 1)))}
                          disabled={parseInt(row.stock || "0", 10) <= 0}
                        >
                          -1
                        </Button>
                        <span className="min-w-[2.5rem] text-center text-lg font-bold tabular-nums flex-1">
                          {row.stock || "0"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-12 text-sm font-bold"
                          onClick={() => updateAiRow(index, "stock", String(parseInt(row.stock || "0", 10) + 1))}
                        >
                          +1
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-2 text-sm"
                          onClick={() => updateAiRow(index, "stock", String(parseInt(row.stock || "0", 10) + 5))}
                        >
                          +5
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {aiResults.length > 0 ? (
              <>
                <Button variant="outline" onClick={() => setAiResults([])}>
                  重新上傳
                </Button>
                <Button onClick={handleAiConfirm} disabled={aiSubmitting}>
                  {aiSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  確認匯入 ({aiResults.filter((r) => r.name.trim() && r.price).length} 道)
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                取消
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
