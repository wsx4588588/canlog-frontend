"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FeedingRecordList } from "@/components/feeding-records/FeedingRecordList";
import { FeedingRecordFormDialog } from "@/components/feeding-records/FeedingRecordFormDialog";
import { getCats, getFeedingRecords } from "@/lib/api";
import type { Cat, FeedingRecord } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

export default function CatDetailPage() {
  const { catId } = useParams<{ catId: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [cat, setCat] = useState<Cat | null>(null);
  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const catIdNum = Number(catId);

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const [cats, recordsRes] = await Promise.all([
          getCats(),
          getFeedingRecords(catIdNum, { page, limit: 20 }),
        ]);
        if (signal?.aborted) return;
        const found = cats.find((c) => c.id === catIdNum) ?? null;
        setCat(found);
        setRecords(recordsRes.items);
        setTotalPages(recordsRes.meta.totalPages);
      } catch {
        if (!signal?.aborted) setCat(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [catIdNum, page]
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadData]);

  const handleRecordChanged = (updated: FeedingRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleRecordDeleted = (id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRecordAdded = (record: FeedingRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  if (authLoading || loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">請先登入。</p>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">找不到此貓咪。</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/my-cats")}>
          返回我的貓咪
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/my-cats")}>
          ← 返回
        </Button>
        {cat.avatarUrl ? (
          <img
            src={cat.avatarUrl}
            alt={cat.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <span className="text-2xl">🐱</span>
        )}
        <h1 className="text-2xl font-bold">{cat.name} 的筆記</h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          共 {records.length} 筆紀錄
        </p>
        <Button onClick={() => setAddDialogOpen(true)}>+ 新增紀錄</Button>
      </div>

      <FeedingRecordList
        catId={catIdNum}
        records={records}
        onRecordChanged={handleRecordChanged}
        onRecordDeleted={handleRecordDeleted}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一頁
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            下一頁
          </Button>
        </div>
      )}

      <FeedingRecordFormDialog
        open={addDialogOpen}
        catId={catIdNum}
        onClose={() => setAddDialogOpen(false)}
        onSaved={(record) => {
          handleRecordAdded(record);
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
}
