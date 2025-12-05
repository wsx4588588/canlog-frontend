"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading, error } = useAuth();
  const [checking, setChecking] = useState(true);
  const hasVerified = useRef(false);

  useEffect(() => {
    // 確保只執行一次驗證
    if (hasVerified.current) return;
    hasVerified.current = true;

    const controller = new AbortController();
    const verify = async () => {
      await checkAuth(controller.signal);
      setChecking(false);
    };
    verify();

    return () => {
      controller.abort();
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!checking && isAuthenticated) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [checking, isAuthenticated, router]);

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            <CardTitle className="mt-4">驗證登入中...</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            請稍候，正在確認您的登入狀態
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <CardTitle className="mt-4">登入失敗</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || "無法驗證您的登入狀態，請重新嘗試"}
            </p>
            <Button onClick={() => router.push("/")}>返回首頁</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-accent" />
          <CardTitle className="mt-4">登入成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          正在為您跳轉至首頁...
        </CardContent>
      </Card>
    </div>
  );
}
