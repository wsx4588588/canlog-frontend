"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Save, Calendar as CalendarIcon } from "lucide-react";
import {
  listInventory,
  upsertInventory,
  copyInventoryFromPrevious,
  type InventoryRow,
  type UpsertInventoryItem,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EditableRow {
  productId: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  isAvailable: boolean;
  todayPrice: number;
  stockQty: number;
  dailyNote: string;
  hasInventory: boolean;
}

function todayInTaipei(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toEditableRow(row: InventoryRow): EditableRow {
  return {
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unit: row.unit,
    defaultPrice: row.defaultPrice,
    isAvailable: row.inventory?.isAvailable ?? false,
    todayPrice: row.inventory?.todayPrice ?? row.defaultPrice,
    stockQty: row.inventory?.stockQty ?? 0,
    dailyNote: row.inventory?.dailyNote ?? "",
    hasInventory: row.inventory !== null,
  };
}

export default function SashimiInventoryPage() {
  const [date, setDate] = useState(todayInTaipei());
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await listInventory(date);
      setRows(data.items.map(toEditableRow));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    reload();
  }, [reload]);

  function patchRow(productId: number, patch: Partial<EditableRow>) {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, ...patch } : r))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const items: UpsertInventoryItem[] = rows.map((r) => ({
        productId: r.productId,
        isAvailable: r.isAvailable,
        todayPrice: r.todayPrice,
        stockQty: r.stockQty,
        dailyNote: r.dailyNote,
      }));
      await upsertInventory(date, items);
      setSuccess("已儲存");
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyFromPrevious() {
    if (!confirm(`從最近一日有庫存的紀錄複製到 ${date}？`)) return;
    setCopying(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await copyInventoryFromPrevious(date);
      setSuccess(`已從 ${result.sourceDate} 複製`);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCopying(false);
    }
  }

  const hasAnyInventory = rows.some((r) => r.hasInventory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">今日庫存</h2>
          <p className="text-sm text-muted-foreground">
            勾選上架的品項，設定價格與數量；客戶 LIFF 看到的「今日漁獲」即此處
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {!hasAnyInventory && !loading && rows.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <span className="text-sm">
            {date} 尚未設定庫存。可以從最近一日複製，或下方直接設定。
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyFromPrevious}
            disabled={copying}
          >
            <Copy className="w-4 h-4 mr-1" />
            {copying ? "複製中..." : "從最近一日複製"}
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md px-3 py-2 text-sm">
          {success}
        </div>
      )}

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">載入中...</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            尚無上架中的商品，請先到「商品管理」新增
          </div>
        ) : (
          rows.map((r) => (
            <div
              key={r.productId}
              className={`border rounded-md p-3 space-y-2 ${
                r.isAvailable ? "bg-white" : "bg-muted/30 opacity-70"
              }`}
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.isAvailable}
                  onChange={(e) =>
                    patchRow(r.productId, { isAvailable: e.target.checked })
                  }
                  className="w-5 h-5 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    <span className="font-mono text-xs text-muted-foreground mr-2">
                      {r.sku}
                    </span>
                    {r.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.category} · 每{r.unit} · 預設 NT$ {r.defaultPrice}
                  </div>
                </div>
              </label>

              {r.isAvailable && (
                <div className="space-y-2 pl-7">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        今日售價
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={r.todayPrice}
                        onChange={(e) =>
                          patchRow(r.productId, {
                            todayPrice: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        庫存
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={r.stockQty}
                        onChange={(e) =>
                          patchRow(r.productId, {
                            stockQty: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      今日備註
                    </label>
                    <Input
                      value={r.dailyNote}
                      onChange={(e) =>
                        patchRow(r.productId, { dailyNote: e.target.value })
                      }
                      placeholder="例：本日特鮮"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">上架</TableHead>
              <TableHead className="w-20">SKU</TableHead>
              <TableHead>商品</TableHead>
              <TableHead className="w-28">今日售價</TableHead>
              <TableHead className="w-24">庫存</TableHead>
              <TableHead>今日備註</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  載入中...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  尚無上架中的商品，請先到「商品管理」新增
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.productId} className={r.isAvailable ? "" : "opacity-60"}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={r.isAvailable}
                      onChange={(e) =>
                        patchRow(r.productId, { isAvailable: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.sku}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.category} · 每{r.unit} · 預設 NT$ {r.defaultPrice}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={r.todayPrice}
                      onChange={(e) =>
                        patchRow(r.productId, {
                          todayPrice: Number(e.target.value),
                        })
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={r.stockQty}
                      onChange={(e) =>
                        patchRow(r.productId, {
                          stockQty: Number(e.target.value),
                        })
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={r.dailyNote}
                      onChange={(e) =>
                        patchRow(r.productId, { dailyNote: e.target.value })
                      }
                      placeholder="例：本日特鮮"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div
        className="sticky bottom-0 z-10 -mx-4 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]
                   bg-background/95 backdrop-blur-sm border-t flex
                   md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0 md:justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={saving || rows.length === 0}
          size="lg"
          className="w-full md:w-auto md:h-9 md:px-4 md:text-sm"
        >
          <Save className="w-4 h-4 mr-1" />
          {saving ? "儲存中..." : "儲存全部"}
        </Button>
      </div>
    </div>
  );
}
