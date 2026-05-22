"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Package, Calendar, ClipboardList, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: typeof Package;
}

const NAV_LINKS: NavLink[] = [
  { href: "/sashimi/admin/products", label: "商品管理", icon: Package },
  { href: "/sashimi/admin/inventory", label: "今日庫存", icon: Calendar },
  { href: "/sashimi/admin/orders", label: "訂單管理", icon: ClipboardList },
];

export default function SashimiAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-muted-foreground">
        驗證中...
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
          <p className="text-muted-foreground">
            此功能僅限生魚片業務管理員使用
          </p>
        </div>
        <Button asChild>
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-3 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">生魚片後台 🐟</h1>
          <p className="text-sm text-muted-foreground mt-1">商品上架、庫存管理</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回 canLog
          </Link>
        </Button>
      </header>

      <nav className="flex gap-2 flex-wrap">
        {NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Button
              key={link.href}
              variant={active ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={link.href} className={cn("inline-flex items-center")}>
                <Icon className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <main>{children}</main>
    </div>
  );
}
