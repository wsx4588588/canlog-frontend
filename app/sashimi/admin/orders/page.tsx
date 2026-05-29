"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Check, ArrowRight } from "lucide-react";
import {
  listOrders,
  updateOrder,
  type OrderStatus,
  type OrderSummary,
  type OrdersSummaryStats,
  type PaymentStatus,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "待確認", label: "待確認" },
  { value: "製作中", label: "製作中" },
  { value: "已完成", label: "已完成" },
  { value: "已取消", label: "已取消" },
];

const STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  待確認: "outline",
  製作中: "default",
  已完成: "secondary",
  已取消: "destructive",
};

const DATE_PRESETS = [
  { key: "today", label: "今日", days: 1 },
  { key: "7d", label: "近 7 天", days: 7 },
  { key: "30d", label: "近 30 天", days: 30 },
  { key: "all", label: "全部", days: 0 },
] as const;
type DatePresetKey = (typeof DATE_PRESETS)[number]["key"] | "custom";

/** 台北時區 YYYY-MM-DD */
function taipeiDateStr(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function nDaysAgoTaipei(days: number): string {
  return taipeiDateStr(new Date(Date.now() - days * 86400000));
}

/** 取「下一階段」狀態，已完成 / 已取消為 terminal 回 null */
function nextOrderStage(
  status: OrderStatus
): { label: string; next: OrderStatus } | null {
  if (status === "待確認") return { label: "接單", next: "製作中" };
  if (status === "製作中") return { label: "完成", next: "已完成" };
  return null;
}

export default function SashimiOrdersListPage() {
  const router = useRouter();
  const today = taipeiDateStr(new Date());

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [summary, setSummary] = useState<OrdersSummaryStats | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [datePreset, setDatePreset] = useState<DatePresetKey>("today");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 把 YYYY-MM-DD 轉成 Taipei 當天的範圍 ISO 字串
      const from = fromDate
        ? new Date(`${fromDate}T00:00:00+08:00`).toISOString()
        : undefined;
      const to = toDate
        ? new Date(`${toDate}T23:59:59.999+08:00`).toISOString()
        : undefined;
      const data = await listOrders({
        status: status === "all" ? undefined : status,
        from,
        to,
        page,
        limit: 20,
      });
      setOrders(data.items);
      setSummary(data.summary);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status, fromDate, toDate, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  function changeStatus(s: OrderStatus | "all") {
    setStatus(s);
    setPage(1);
  }

  function applyDatePreset(key: DatePresetKey) {
    setDatePreset(key);
    setPage(1);
    const preset = DATE_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (preset.key === "all") {
      setFromDate("");
      setToDate("");
    } else if (preset.key === "today") {
      setFromDate(today);
      setToDate(today);
    } else {
      setFromDate(nDaysAgoTaipei(preset.days - 1));
      setToDate(today);
    }
  }

  function onCustomDateChange(field: "from" | "to", value: string) {
    setDatePreset("custom");
    setPage(1);
    if (field === "from") setFromDate(value);
    else setToDate(value);
  }

  async function patchOrder(
    orderId: number,
    body: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
  ) {
    setUpdating(orderId);
    try {
      await updateOrder(orderId, body);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">訂單管理</h2>
          <p className="text-sm text-muted-foreground">
            點訂單列查看詳情並更改狀態
          </p>
        </div>
        <Button asChild>
          <Link href="/sashimi/admin/orders/new">
            <Plus className="w-4 h-4 mr-1" />
            新增手動訂單
          </Link>
        </Button>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard label="訂單筆數" value={summary.count} unit="筆" />
          <StatCard
            label="已收"
            value={summary.revenueAmount}
            currency
            tone="emerald"
          />
          <StatCard
            label="待收"
            value={summary.pendingAmount}
            currency
            tone="amber"
          />
          <StatCard
            label="已取消"
            value={summary.cancelledCount}
            unit="筆"
            tone="muted"
          />
        </div>
      )}

      {/* Date filter */}
      <div className="space-y-2 border rounded-md p-3 bg-muted/30">
        <div className="flex gap-2 flex-wrap">
          {DATE_PRESETS.map((p) => (
            <Button
              key={p.key}
              variant={datePreset === p.key ? "default" : "outline"}
              size="sm"
              onClick={() => applyDatePreset(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="text-muted-foreground">從</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onCustomDateChange("from", e.target.value)}
            className="w-40"
          />
          <span className="text-muted-foreground">到</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => onCustomDateChange("to", e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <Button
            key={s.value}
            variant={status === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => changeStatus(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">載入中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">尚無訂單</div>
        ) : (
          orders.map((o) => {
            const next = nextOrderStage(o.orderStatus);
            const isUpdating = updating === o.id;
            return (
              <div
                key={o.id}
                onClick={() => router.push(`/sashimi/admin/orders/${o.id}`)}
                className="border rounded-md p-3 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-mono text-sm text-blue-600">
                    {o.orderNumber}
                  </div>
                  <div
                    className="flex gap-1 flex-wrap justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge variant={STATUS_VARIANTS[o.orderStatus]}>
                      {o.orderStatus}
                    </Badge>
                    <Badge
                      variant={o.paymentStatus === "已付" ? "default" : "outline"}
                    >
                      {o.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">{o.customerName}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {o.customerPhone}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {o.itemsSummary}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt)} · {o.pickupMethod}
                      {o.pickupTime ? ` ${o.pickupTime}` : ""}
                    </div>
                    <div className="font-medium text-red-600">
                      NT$ {o.totalAmount}
                    </div>
                  </div>
                </div>

                {(next || o.paymentStatus === "未付") && (
                  <div
                    className="flex gap-2 mt-3 pt-3 border-t"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {next && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        disabled={isUpdating}
                        onClick={() =>
                          patchOrder(o.id, { orderStatus: next.next })
                        }
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        {next.label}
                      </Button>
                    )}
                    {o.paymentStatus === "未付" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={isUpdating}
                        onClick={() =>
                          patchOrder(o.id, { paymentStatus: "已付" })
                        }
                      >
                        <Check className="w-4 h-4 mr-1" />
                        已付
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單編號</TableHead>
              <TableHead>下單時間</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>品項</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>取貨</TableHead>
              <TableHead>付款</TableHead>
              <TableHead>狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  載入中...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  尚無訂單
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const next = nextOrderStage(o.orderStatus);
                const isUpdating = updating === o.id;
                return (
                  <TableRow key={o.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/sashimi/admin/orders/${o.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {o.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.customerPhone}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs line-clamp-2">
                        {o.itemsSummary}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      NT$ {o.totalAmount}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <div>{o.pickupMethod}</div>
                      {o.pickupTime && (
                        <div className="text-muted-foreground">
                          {o.pickupTime}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge
                          variant={
                            o.paymentStatus === "已付" ? "default" : "outline"
                          }
                        >
                          {o.paymentStatus}
                        </Badge>
                        {o.paymentStatus === "未付" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isUpdating}
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              patchOrder(o.id, { paymentStatus: "已付" })
                            }
                          >
                            <Check className="w-3 h-3 mr-0.5" />
                            標已付
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant={STATUS_VARIANTS[o.orderStatus]}>
                          {o.orderStatus}
                        </Badge>
                        {next && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isUpdating}
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              patchOrder(o.id, { orderStatus: next.next })
                            }
                          >
                            <ArrowRight className="w-3 h-3 mr-0.5" />
                            {next.label}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            共 {total} 筆，第 {page} / {totalPages} 頁
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
              上一頁
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一頁
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }).format(d);
}

function StatCard({
  label,
  value,
  unit,
  currency,
  tone = "default",
}: {
  label: string;
  value: number;
  unit?: string;
  currency?: boolean;
  tone?: "default" | "emerald" | "amber" | "muted";
}) {
  const toneClasses = {
    default: "border-gray-200 bg-white",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
    muted: "border-gray-200 bg-gray-50 text-muted-foreground",
  }[tone];

  const numberToneClasses = {
    default: "text-gray-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    muted: "text-gray-500",
  }[tone];

  const formatted = currency
    ? `NT$ ${value.toLocaleString("zh-TW")}`
    : value.toLocaleString("zh-TW");

  return (
    <div className={`border rounded-md px-3 py-2 ${toneClasses}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg sm:text-xl font-bold ${numberToneClasses}`}>
        {formatted}
        {unit && (
          <span className="text-xs font-normal ml-1 text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
