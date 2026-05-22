"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getOrder,
  updateOrder,
  type OrderDetail,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ORDER_STATUSES: OrderStatus[] = [
  "待確認",
  "製作中",
  "已完成",
  "已取消",
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

export default function SashimiOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(id);
      setOrder(data);
      setNote(data.note);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (Number.isFinite(id)) reload();
  }, [id, reload]);

  async function patch(payload: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    note?: string;
  }) {
    setSaving(true);
    setError(null);
    try {
      const data = await updateOrder(id, payload);
      setOrder(data);
      setNote(data.note);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">載入中...</div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sashimi/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-1" />
            回列表
          </Link>
        </Button>
        <div className="text-center text-muted-foreground py-8">
          {error ?? "找不到此訂單"}
        </div>
      </div>
    );
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
        <h2 className="text-xl font-semibold font-mono">{order.orderNumber}</h2>
        <Badge variant={STATUS_VARIANTS[order.orderStatus]}>
          {order.orderStatus}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">訂單品項</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">SKU</TableHead>
                  <TableHead>品名</TableHead>
                  <TableHead className="text-right">單價</TableHead>
                  <TableHead className="text-right">數量</TableHead>
                  <TableHead className="text-right">小計</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((i) => (
                  <TableRow key={i.productId}>
                    <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                    <TableCell>{i.productName}</TableCell>
                    <TableCell className="text-right">
                      NT$ {i.unitPrice}
                    </TableCell>
                    <TableCell className="text-right">{i.qty}</TableCell>
                    <TableCell className="text-right font-medium">
                      NT$ {i.unitPrice * i.qty}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell colSpan={4} className="text-right">
                    總計
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    NT$ {order.totalAmount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">客戶資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="姓名" value={order.customerName} />
              <Row label="電話" value={order.customerPhone} mono />
              {order.lineUserId && (
                <Row label="LINE ID" value={order.lineUserId} mono small />
              )}
              <Row label="來源" value={order.source} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">取貨資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="方式" value={order.pickupMethod} />
              <Row label="時間" value={order.pickupTime || "—"} />
              {order.pickupMethod === "外送" && (
                <Row label="地址" value={order.address || "—"} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">訂單狀態</div>
            <div className="flex gap-2 flex-wrap">
              {ORDER_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={order.orderStatus === s ? "default" : "outline"}
                  size="sm"
                  disabled={saving || order.orderStatus === s}
                  onClick={() => patch({ orderStatus: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">付款狀態</div>
            <div className="flex gap-2">
              <Button
                variant={order.paymentStatus === "未付" ? "default" : "outline"}
                size="sm"
                disabled={saving || order.paymentStatus === "未付"}
                onClick={() => patch({ paymentStatus: "未付" })}
              >
                未付
              </Button>
              <Button
                variant={order.paymentStatus === "已付" ? "default" : "outline"}
                size="sm"
                disabled={saving || order.paymentStatus === "已付"}
                onClick={() => patch({ paymentStatus: "已付" })}
              >
                已付（{order.paymentMethod}）
              </Button>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">備註</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-input rounded-md px-3 py-2 text-sm"
              placeholder="客戶備註或店家筆記..."
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                disabled={saving || note === order.note}
                onClick={() => patch({ note })}
              >
                儲存備註
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono" : ""} ${
          small ? "text-xs break-all" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
