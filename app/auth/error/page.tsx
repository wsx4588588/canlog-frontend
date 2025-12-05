'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const errorMessages: Record<string, string> = {
  access_denied: '您取消了登入授權',
  unauthorized: '授權失敗，請重新嘗試',
  server_error: '伺服器發生錯誤，請稍後再試',
  default: '登入過程中發生錯誤',
};

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const errorCode = searchParams.get('error') || searchParams.get('message') || 'default';
  const errorMessage = errorMessages[errorCode] || errorCode;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <CardTitle className="mt-4">登入失敗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            {errorMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
            <Button
              className="flex-1"
              onClick={login}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新登入
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorContent />
    </Suspense>
  );
}
