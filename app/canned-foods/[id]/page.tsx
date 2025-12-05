'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NutritionDisplay } from '@/components/nutrition-display';
import { getCannedFood, deleteCannedFood, getImageUrl } from '@/lib/api';
import type { CannedFood } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

interface PageProps {
  params: { id: string };
}

export default function CannedFoodDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [cannedFood, setCannedFood] = useState<CannedFood | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCannedFood(parseInt(params.id, 10));
        setCannedFood(data);
      } catch (err) {
        setError('找不到此罐頭資料');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!cannedFood) return;
    if (!confirm('確定要刪除此筆資料嗎？')) return;

    setDeleting(true);
    try {
      await deleteCannedFood(cannedFood.id);
      router.push('/');
    } catch (err) {
      alert('刪除失敗，請重試');
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !cannedFood) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">{error || '找不到此罐頭資料'}</h3>
        <Button asChild className="mt-4">
          <Link href="/">返回列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between animate-fade-in">
        <Button variant="ghost" asChild>
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>
        </Button>
        {/* 只有 admin 才顯示刪除按鈕 */}
        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            刪除
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左側：圖片和基本資訊 */}
        <div className="space-y-4 animate-fade-in animate-delay-100">
          {/* 圖片 */}
          <Card className="overflow-hidden">
            <div className="aspect-[4/3] bg-muted">
              {cannedFood.imageUrl ? (
                <img
                  src={getImageUrl(cannedFood.imageUrl)}
                  alt={cannedFood.productName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </Card>

          {/* 基本資訊 */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>建立於 {formatDate(cannedFood.createdAt)}</span>
              </div>
              {cannedFood.updatedAt !== cannedFood.createdAt && (
                <div className="text-sm text-muted-foreground">
                  最後更新：{formatDate(cannedFood.updatedAt)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右側：營養資訊 */}
        <div className="animate-fade-in animate-delay-200">
          <NutritionDisplay cannedFood={cannedFood} showDryMatter={true} />
        </div>
      </div>

      {/* 原始回應（可選顯示） */}
      {cannedFood.rawResponse && (
        <Card className="animate-fade-in animate-delay-300">
          <CardContent className="p-4">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                查看 AI 原始回應
              </summary>
              <pre className="mt-3 p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                {cannedFood.rawResponse}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

