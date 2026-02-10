"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  ClipboardList,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Upload,
  Search,
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
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getDishes,
  analyzeOrderImage,
} from "@/lib/api";
import type { Dish, Order } from "@/lib/types";
import { OrderStatus } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.NOT_PICKED_UP]: "未取餐",
  [OrderStatus.PICKED_UP]: "已取餐",
  [OrderStatus.CANCELLED]: "已取消",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.NOT_PICKED_UP]: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  [OrderStatus.PICKED_UP]: "bg-green-500/10 text-green-700 border-green-500/30",
  [OrderStatus.CANCELLED]: "bg-red-500/10 text-red-700 border-red-500/30",
};

interface OrderItemForm {
  dishId: number;
  quantity: number;
}

/**
 * 模糊比對料理名稱，回傳最佳匹配的 dishId
 */
function matchDishByName(dishName: string, dishes: Dish[]): number {
  // 精確匹配
  const exact = dishes.find((d) => d.name === dishName);
  if (exact) return exact.id;

  // 包含匹配
  const contains = dishes.find(
    (d) => d.name.includes(dishName) || dishName.includes(d.name),
  );
  if (contains) return contains.id;

  return 0;
}

export default function OrdersPage() {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // 新增訂單 Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPickupTime, setFormPickupTime] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formItems, setFormItems] = useState<OrderItemForm[]>([{ dishId: 0, quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  // AI 匯入訂單 Dialog
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const fetchOrders = async (search?: string) => {
    try {
      setLoading(true);
      const status = statusFilter === "ALL" ? undefined : statusFilter;
      const data = await getOrders(status, search || undefined);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders(activeSearch);
    }
  }, [isAdmin, statusFilter, activeSearch]);

  const handleSearch = () => {
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
  };

  // ===== 手動新增訂單 =====

  const openCreateDialog = async () => {
    try {
      const activeDishes = await getDishes(true);
      setDishes(activeDishes);
    } catch {
      alert("無法載入料理列表");
      return;
    }
    setFormName("");
    setFormPhone("");
    setFormPickupTime("");
    setFormNote("");
    setFormItems([{ dishId: 0, quantity: 1 }]);
    setDialogOpen(true);
  };

  const addFormItem = () => {
    setFormItems([...formItems, { dishId: 0, quantity: 1 }]);
  };

  const removeFormItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const updateFormItem = (index: number, field: keyof OrderItemForm, value: number) => {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormItems(updated);
  };

  const calculateTotal = (): number => {
    return formItems.reduce((sum, item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      if (!dish) return sum;
      return sum + dish.price * item.quantity;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (!formName.trim() || !formPhone.trim() || !formPickupTime.trim()) return;
    const validItems = formItems.filter((item) => item.dishId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      alert("請至少選擇一道料理");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        customerName: formName.trim(),
        customerPhone: formPhone.trim(),
        pickupTime: formPickupTime.trim(),
        note: formNote.trim() || undefined,
        items: validItems,
      });
      setDialogOpen(false);
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "建立訂單失敗");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== AI 匯入訂單 =====

  const openAiDialog = () => {
    setAiFile(null);
    setAiPreview(null);
    setAiAnalyzing(false);
    setAiDialogOpen(true);
  };

  const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiFile(file);
      setAiPreview(URL.createObjectURL(file));
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiFile) return;

    // 先載入料理列表
    let activeDishes: Dish[];
    try {
      activeDishes = await getDishes(true);
      setDishes(activeDishes);
    } catch {
      alert("無法載入料理列表");
      return;
    }

    setAiAnalyzing(true);
    try {
      const result = await analyzeOrderImage(aiFile);

      // 用 AI 結果填入表單
      setFormName(result.customerName);
      setFormPhone(result.customerPhone);
      setFormPickupTime(result.pickupTime);
      setFormNote(result.note);

      // 比對料理 -> 自動選擇 dishId
      const matchedItems: OrderItemForm[] = result.items.map((item) => ({
        dishId: matchDishByName(item.dishName, activeDishes),
        quantity: item.quantity,
      }));

      // 如果完全沒匹配到任何一道，至少保留一列空的
      setFormItems(matchedItems.length > 0 ? matchedItems : [{ dishId: 0, quantity: 1 }]);

      // 關閉 AI Dialog，打開訂單表單 Dialog
      setAiDialogOpen(false);
      setDialogOpen(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "訂單分析失敗");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // ===== 訂單狀態操作 =====

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    const label = status === OrderStatus.PICKED_UP ? "標記為已取餐" : "取消此訂單";
    if (!confirm(`確定要${label}嗎？`)) return;
    try {
      await updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新狀態失敗");
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`確定要刪除${order.customerName}的訂單嗎？（庫存將自動回補）`)) return;
    try {
      await deleteOrder(order.id);
      await fetchOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "刪除失敗");
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

  const statusTabs = [
    { value: "ALL", label: "全部" },
    { value: OrderStatus.NOT_PICKED_UP, label: "未取餐" },
    { value: OrderStatus.PICKED_UP, label: "已取餐" },
    { value: OrderStatus.CANCELLED, label: "已取消" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">訂單管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理年菜訂單、取餐狀態</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openAiDialog}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI 匯入訂單
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            新增訂單
          </Button>
        </div>
      </div>

      {/* 搜尋框 + 狀態篩選 */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋客戶姓名或電話..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="default" className="shrink-0">
            <Search className="h-4 w-4 mr-1.5" />
            搜尋
          </Button>
          {activeSearch && (
            <Button onClick={handleClearSearch} variant="outline" className="shrink-0">
              <X className="h-4 w-4 mr-1.5" />
              清除
            </Button>
          )}
        </div>
        {activeSearch && (
          <p className="text-sm text-muted-foreground">
            搜尋「<span className="font-medium text-foreground">{activeSearch}</span>」的結果，共 {orders.length} 筆
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={statusFilter === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 載入中 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* 無資料 */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">尚無訂單</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">點擊「新增訂單」或「AI 匯入訂單」開始添加</p>
        </div>
      )}

      {/* 訂單列表 */}
      {!loading && orders.length > 0 && (
        <div className="grid gap-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <Card key={order.id} className="transition-all">
                <CardContent className="p-4">
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{order.customerName}</h3>
                        <Badge variant="outline" className={STATUS_COLORS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.pickupTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold text-primary whitespace-nowrap">
                        ${order.totalAmount.toLocaleString()}
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">餐點明細</h4>
                        <div className="rounded-lg border bg-muted/30 divide-y">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                              <span>{item.dishName}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground">
                                  ${item.unitPrice} x {item.quantity}
                                </span>
                                <span className="font-medium w-20 text-right">
                                  ${item.subtotal.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.note && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">備註</h4>
                          <p className="text-sm bg-muted/30 rounded-lg p-3">{order.note}</p>
                        </div>
                      )}

                      {order.status === OrderStatus.NOT_PICKED_UP && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, OrderStatus.PICKED_UP); }}>
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            標記已取餐
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, OrderStatus.CANCELLED); }}>
                            <XCircle className="h-4 w-4 mr-1.5" />
                            取消訂單
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order); }}>
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            刪除
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        建立時間：{new Date(order.createdAt).toLocaleString("zh-TW")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 新增訂單 Dialog（也作為 AI 分析後的確認表單） */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>新增訂單</DialogTitle>
            <DialogDescription>輸入客戶資料並選擇餐點，確認無誤後送出</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">客戶姓名</label>
                <Input placeholder="例：邱彥齊" value={formName}
                  onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">電話</label>
                <Input placeholder="例：0975141773" value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">取餐時間</label>
              <Input placeholder="例：1/28(除夕)當天中午" value={formPickupTime}
                onChange={(e) => setFormPickupTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">餐點</label>
                <Button variant="ghost" size="sm" onClick={addFormItem}>
                  <Plus className="h-3 w-3 mr-1" />
                  加一道
                </Button>
              </div>
              <div className="space-y-2">
                {formItems.map((item, index) => {
                  const selectedDish = dishes.find((d) => d.id === item.dishId);
                  return (
                    <div key={index} className="border rounded-lg p-3 space-y-2 bg-background">
                      {/* 料理選擇 + 刪除 */}
                      <div className="flex items-center gap-2">
                        <select
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1"
                          value={item.dishId}
                          onChange={(e) => updateFormItem(index, "dishId", parseInt(e.target.value, 10))}
                        >
                          <option value={0}>選擇料理</option>
                          {dishes.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} (${d.price}) 庫存:{d.stock}
                            </option>
                          ))}
                        </select>
                        {formItems.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => removeFormItem(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* 數量 + 小計 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground shrink-0">數量</span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-12 text-sm font-bold"
                          onClick={() => updateFormItem(index, "quantity", Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -1
                        </Button>
                        <span className="min-w-[2rem] text-center text-lg font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-12 text-sm font-bold"
                          onClick={() => updateFormItem(index, "quantity", item.quantity + 1)}
                        >
                          +1
                        </Button>
                        {selectedDish && (
                          <span className="text-sm font-bold text-primary ml-auto whitespace-nowrap">
                            ${(selectedDish.price * item.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">總計：</span>
                <span className="text-lg font-bold text-primary ml-1">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">備註（選填）</label>
              <Input placeholder="例：希望鮭魚切成比較小片" value={formNote}
                onChange={(e) => setFormNote(e.target.value)} />
            </div>

            {/* 如果有未匹配的料理，顯示提示 */}
            {formItems.some((item) => item.dishId === 0 && item.quantity > 0) && (
              <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                有部分料理未能自動匹配，請手動選擇正確的料理
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitOrder}
              disabled={
                submitting ||
                !formName.trim() ||
                !formPhone.trim() ||
                !formPickupTime.trim() ||
                formItems.every((i) => i.dishId === 0)
              }
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              建立訂單
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 匯入訂單 Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 匯入訂單
            </DialogTitle>
            <DialogDescription>
              上傳訂單表單圖片，AI 將自動辨識客戶資料和餐點，辨識後可修改再確認
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label
              htmlFor="ai-order-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                aiPreview ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {aiPreview ? (
                <img src={aiPreview} alt="訂單預覽" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">點擊上傳訂單表單圖片</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">支援 JPG, PNG, WEBP（最大 10MB）</p>
                </>
              )}
              <input
                id="ai-order-upload"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
