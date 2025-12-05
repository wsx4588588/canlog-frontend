'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, ChevronDown, Loader2 } from 'lucide-react';
import type { User } from '@/types/auth';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
          {user.displayName}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            onMouseDown={(e) => e.preventDefault()}
          />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card shadow-lg z-[101]">
            <div className="p-3 border-b">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-destructive hover:text-destructive"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                登出
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

