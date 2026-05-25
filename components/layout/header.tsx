"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cat,
  Upload,
  List,
  Loader2,
  Menu,
  X,
  UtensilsCrossed,
  ClipboardList,
  Fish,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 路由切換時自動關閉手機選單
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 基本導航項目
  const navItems = [{ href: "/", label: "罐頭列表", icon: List }];

  // 只有 admin 才顯示管理功能
  if (isAdmin) {
    // navItems.push({ href: '/upload', label: '上傳分析', icon: Upload });
    navItems.push({
      href: "/dishes",
      label: "年菜管理",
      icon: UtensilsCrossed,
    });
    navItems.push({ href: "/orders", label: "訂單管理", icon: ClipboardList });
    navItems.push({
      href: "/sashimi/admin",
      label: "生魚片後台",
      icon: Fish,
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-all" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Cat className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              CanLog
            </h1>
            <p className="hidden sm:block text-xs text-muted-foreground -mt-0.5">
              寵物罐頭營養分析
            </p>
          </div>
        </Link>

        {/* 桌面版導航 */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="h-6 w-px bg-border" />

          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : (
            <GoogleLoginButton />
          )}
        </div>

        {/* 手機版：auth + 漢堡按鈕 */}
        <div className="flex md:hidden items-center gap-3">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : (
            <GoogleLoginButton />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 手機版展開選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
