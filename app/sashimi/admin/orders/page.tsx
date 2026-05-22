"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  listOrders,
  type OrderStatus,
  type OrderSummary,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
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

export default function SashimiOrdersListPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders({
        status: status === "all" ? undefined : status,
        page,
        limit: 20,
      });
      setOrders(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  function changeStatus(s: OrderStatus | "all") {
    setStatus(s);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
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

      <div className="border rounded-md">
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
              orders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50">
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
                    <div className="font-medium text-sm">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.customerPhone}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs line-clamp-2">{o.itemsSummary}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    NT$ {o.totalAmount}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    <div>{o.pickupMethod}</div>
                    {o.pickupTime && (
                      <div className="text-muted-foreground">{o.pickupTime}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        o.paymentStatus === "已付" ? "default" : "outline"
                      }
                    >
                      {o.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[o.orderStatus]}>
                      {o.orderStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
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
