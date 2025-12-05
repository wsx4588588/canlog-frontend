'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cat, Upload, List, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

  // 基本導航項目
  const navItems = [
    { href: '/', label: '罐頭列表', icon: List },
  ];

  // 只有 admin 才顯示上傳分析
  if (isAdmin) {
    navItems.push({ href: '/upload', label: '上傳分析', icon: Upload });
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
            <p className="text-xs text-muted-foreground -mt-0.5">寵物罐頭營養分析</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
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
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
      </div>
    </header>
  );
}

