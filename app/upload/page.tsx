'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, ImageIcon, Loader2, CheckCircle2, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { analyzeImage } from '@/lib/api';
import type { CannedFood } from '@/lib/types';
import { NutritionDisplay } from '@/components/nutrition-display';
import { useAuth } from '@/hooks/useAuth';

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CannedFood | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
      setError(null);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(20);

    try {
      setStatus('analyzing');
      setProgress(50);

      const response = await analyzeImage(file);
      
      setProgress(100);
      setStatus('success');
      setResult(response.data);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '分析失敗，請重試');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResult(null);
  };

  // 載入中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 權限檢查：未登入或非 admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-20">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">權限不足</h1>
          <p className="text-muted-foreground">
            {!isAuthenticated 
              ? "請先登入以使用此功能" 
              : "此功能僅限管理員使用"}
          </p>
        </div>
        <Button asChild>
          <Link href="/">返回首頁</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 頁面標題 */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">上傳分析</h1>
        <p className="text-muted-foreground">
          上傳寵物罐頭營養標示圖片，AI 將自動分析營養成分
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 上傳區域 */}
        <Card className="animate-fade-in animate-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              圖片上傳
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview ? (
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                  transition-all duration-300 ease-out
                  ${isDragActive 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className={`h-8 w-8 text-primary transition-transform ${isDragActive ? 'scale-110' : ''}`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? '放開以上傳圖片' : '拖拽圖片到此處'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      或點擊選擇檔案 (JPG, PNG, WEBP，最大 10MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {status === 'idle' && (
                    <button
                      onClick={handleReset}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {file && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <Badge variant="secondary">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                )}

                {/* 進度條 */}
                {(status === 'uploading' || status === 'analyzing') && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      {status === 'uploading' ? '上傳中...' : 'AI 分析中，請稍候...'}
                    </p>
                  </div>
                )}

                {/* 錯誤訊息 */}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* 成功訊息 */}
                {status === 'success' && (
                  <div className="flex items-center gap-2 text-accent bg-accent/10 rounded-lg p-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">分析完成！</p>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex gap-3">
                  {status === 'idle' && (
                    <Button onClick={handleAnalyze} className="flex-1" size="lg">
                      <Upload className="h-4 w-4 mr-2" />
                      開始分析
                    </Button>
                  )}
                  {(status === 'uploading' || status === 'analyzing') && (
                    <Button disabled className="flex-1" size="lg">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </Button>
                  )}
                  {(status === 'success' || status === 'error') && (
                    <>
                      <Button onClick={handleReset} variant="outline" className="flex-1" size="lg">
                        重新上傳
                      </Button>
                      {status === 'success' && result && (
                        <Button onClick={() => router.push(`/canned-foods/${result.id}`)} className="flex-1" size="lg">
                          查看詳情
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分析結果 */}
        <div className="animate-fade-in animate-delay-200">
          {result ? (
            <NutritionDisplay cannedFood={result} />
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center space-y-4 py-12">
                <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-lg font-medium text-muted-foreground">尚無分析結果</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    上傳圖片後，分析結果將顯示於此
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

