"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CatCard } from "@/components/cats/CatCard";
import { CatFormDialog } from "@/components/cats/CatFormDialog";
import { getCats, deleteCat } from "@/lib/api";
import type { Cat } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

export default function MyCatsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Cat | undefined>();

  const loadCats = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getCats();
      if (!signal?.aborted) setCats(data);
    } catch {
      if (!signal?.aborted) setCats([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    loadCats(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadCats]);

  const handleDelete = async (cat: Cat) => {
    if (!confirm(`確認刪除「${cat.name}」及其所有餵食紀錄？`)) return;
    try {
      await deleteCat(cat.id);
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
    } catch {
      alert("刪除失敗，請重試");
    }
  };

  const handleEdit = (cat: Cat) => {
    setEditingCat(cat);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCat(undefined);
  };

  const handleSaved = (saved: Cat) => {
    setCats((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      if (exists) return prev.map((c) => (c.id === saved.id ? saved : c));
      return [saved, ...prev];
    });
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
        <p className="text-muted-foreground">請先登入以管理你的貓咪。</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的貓咪</h1>
        <Button onClick={() => setDialogOpen(true)}>+ 新增貓咪</Button>
      </div>

      {cats.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          還沒有貓咪，點擊「新增貓咪」開始記錄吧！
        </p>
      ) : (
        <div className="space-y-3">
          {cats.map((cat) => (
            <CatCard
              key={cat.id}
              cat={cat}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CatFormDialog
        open={dialogOpen}
        editing={editingCat}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
      />
    </div>
  );
}
