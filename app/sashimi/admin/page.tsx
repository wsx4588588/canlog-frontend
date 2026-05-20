import Link from "next/link";
import { Package, Calendar } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SashimiAdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Link href="/sashimi/admin/products" className="block">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>商品管理</CardTitle>
            </div>
            <CardDescription>新增、編輯、停售生魚片品項</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SKU 自動產生（P001、P002...），停售後歷史訂單仍可顯示。
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/sashimi/admin/inventory" className="block">
        <Card className="hover:shadow-md transition-shadow h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle>今日庫存</CardTitle>
            </div>
            <CardDescription>勾選今日上架品項、調整數量與價格</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              客戶 LIFF 看到的「今日漁獲」就是這裡設定的。可一鍵「從昨日複製」。
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
