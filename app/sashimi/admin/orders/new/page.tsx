"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, UserPlus, X, Check } from "lucide-react";
import {
  listInventory,
  searchCustomers,
  createCustomer,
  createManualOrder,
  type InventoryRow,
  type CustomerSummary,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PickupMethod = "自取" | "外送";

function todayInTaipei(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function NewManualOrderPage() {
  const router = useRouter();

  // Customer
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  // Products
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Pickup
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>("自取");
  const [pickupTime, setPickupTime] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load today's inventory once
  useEffect(() => {
    (async () => {
      try {
        const data = await listInventory(todayInTaipei());
        setInventory(
          data.items.filter(
            (r) =>
              r.inventory !== null &&
              r.inventory.isAvailable &&
              r.inventory.stockQty > 0
          )
        );
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // Debounced customer search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const results = await searchCustomers(q);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const cartItems = useMemo(
    () =>
      inventory
        .filter((r) => (cart[r.sku] ?? 0) > 0)
        .map((r) => ({ row: r, qty: cart[r.sku] })),
    [inventory, cart]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, { row, qty }) => sum + (row.inventory!.todayPrice ?? 0) * qty,
        0
      ),
    [cartItems]
  );

  const canSubmit =
    !!customer &&
    cartItems.length > 0 &&
    pickupTime.length > 0 &&
    (pickupMethod === "自取" || address.trim().length > 0) &&
    !submitting;

  function patchCart(sku: string, qty: number, max: number) {
    setCart((prev) => ({ ...prev, [sku]: Math.max(0, Math.min(max, qty)) }));
  }

  async function handleSubmit() {
    if (!canSubmit || !customer) return;
    setSubmitting(true);
    setError(null);
    try {
      await createManualOrder({
        customerId: customer.id,
        items: cartItems.map(({ row, qty }) => ({
          productId: row.sku,
          qty,
        })),
        pickupMethod,
        pickupTime,
        address: pickupMethod === "外送" ? address.trim() : undefined,
        note: note.trim() || undefined,
      });
      router.push("/sashimi/admin/orders");
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sashimi/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-1" />
            回列表
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">新增手動訂單</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">客戶</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">{customer.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {customer.phone} · {customer.source} · 累計 {customer.orderCount} 單
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomer(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜尋姓名或電話..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchQuery.trim() && (
                <div className="border rounded-md max-h-64 overflow-y-auto">
                  {searching ? (
                    <div className="text-center text-muted-foreground py-3 text-sm">
                      搜尋中...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-3 text-sm">
                      查無客戶
                    </div>
                  ) : (
                    searchResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCustomer(c);
                          setSearchQuery("");
                          setSearchResults([]);
                          if (c.defaultAddress) setAddress(c.defaultAddress);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-b-0"
                      >
                        <div className="font-medium">{c.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.phone} · {c.orderCount} 單
                          {c.lineUserId ? " · LINE" : ""}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCustomerOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                找不到？新增客戶
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">品項（今日庫存）</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProducts ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              載入中...
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              今日尚無上架庫存，請先到「今日庫存」設定
            </div>
          ) : (
            <div className="space-y-2">
              {inventory.map((row) => {
                const inv = row.inventory!;
                const qty = cart[row.sku] ?? 0;
                return (
                  <div
                    key={row.sku}
                    className="flex items-center gap-3 border rounded-md p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {row.name}
                        <span className="ml-2 text-xs text-muted-foreground font-mono">
                          {row.sku}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        NT$ {inv.todayPrice} · 剩 {inv.stockQty} {row.unit}
                        {inv.dailyNote && ` · ${inv.dailyNote}`}
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={qty}
                      onChange={(e) =>
                        patchCart(row.sku, Number(e.target.value), inv.stockQty)
                      }
                      min={0}
                      max={inv.stockQty}
                      className="w-20"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {cartItems.length} 項
              </div>
              <div className="text-lg font-bold text-red-600">
                NT$ {subtotal}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pickup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">取貨資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {(["自取", "外送"] as PickupMethod[]).map((m) => (
              <Button
                key={m}
                variant={pickupMethod === m ? "default" : "outline"}
                size="sm"
                onClick={() => setPickupMethod(m)}
              >
                {m}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                預計取貨時間
              </label>
              <Input
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>
            {pickupMethod === "外送" && (
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">
                  外送地址
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="台北市信義區市府路 1 號"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              備註（選填）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
              placeholder="例：不加芥末、社群朋友轉介..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
          <Check className="w-4 h-4 mr-1" />
          {submitting ? "建立中..." : `送出（NT$ ${subtotal}）`}
        </Button>
      </div>

      <NewCustomerDialog
        open={newCustomerOpen}
        onOpenChange={setNewCustomerOpen}
        initialPhone={searchQuery.match(/^\d+$/) ? searchQuery : ""}
        initialName={searchQuery && !searchQuery.match(/^\d+$/) ? searchQuery : ""}
        onCreated={(c) => {
          setCustomer(c);
          setSearchQuery("");
          setNewCustomerOpen(false);
          if (c.defaultAddress) setAddress(c.defaultAddress);
        }}
      />
    </div>
  );
}

function NewCustomerDialog({
  open,
  onOpenChange,
  initialPhone,
  initialName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialPhone: string;
  initialName: string;
  onCreated: (c: CustomerSummary) => void;
}) {
  const [displayName, setDisplayName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [defaultAddress, setDefaultAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when open changes
  useEffect(() => {
    if (open) {
      setDisplayName(initialName);
      setPhone(initialPhone);
      setDefaultAddress("");
      setNote("");
      setError(null);
    }
  }, [open, initialName, initialPhone]);

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      if (!displayName.trim() || !phone.trim()) {
        throw new Error("姓名與電話為必填");
      }
      const c = await createCustomer({
        displayName: displayName.trim(),
        phone: phone.trim(),
        defaultAddress: defaultAddress.trim() || undefined,
        note: note.trim() || undefined,
      });
      onCreated(c);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新增客戶</DialogTitle>
          <DialogDescription>
            建立社群手動補登客戶。電話若已存在會被擋下。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              姓名 *
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              電話 *
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              預設地址（選填）
            </label>
            <Input
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              備註（選填）
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：王老闆介紹"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? "建立中..." : "建立並選用"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
