"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CannedFoodPicker } from "./CannedFoodPicker";
import { createFeedingRecord, updateFeedingRecord } from "@/lib/api";
import {
  CatReaction,
  type CannedFood,
  type FeedingRecord,
  type CreateFeedingRecordInput,
} from "@/lib/types";
import { REACTION_CONFIG } from "./ReactionBadge";
import { cn } from "@/lib/utils";

interface FeedingRecordFormDialogProps {
  open: boolean;
  catId: number;
  /** 從罐頭詳情頁進入時預填，使用者不需再選 */
  preselectedFood?: Pick<CannedFood, "id" | "brandName" | "productName" | "imageUrl">;
  onClose: () => void;
  onSaved: (record: FeedingRecord) => void;
  editing?: FeedingRecord;
}

const REACTIONS = Object.values(CatReaction);

export function FeedingRecordFormDialog({
  open,
  catId,
  preselectedFood,
  onClose,
  onSaved,
  editing,
}: FeedingRecordFormDialogProps) {
  const initialFood: CannedFood | null = editing
    ? { ...editing.cannedFood, calories: null, protein: null, fat: null, moisture: null, fiber: null, ash: null, phosphorusPer100kcal: null, calciumPer100kcal: null, calciumPhosphorusRatio: null, nutrition: null, createdAt: "", updatedAt: "" }
    : preselectedFood
    ? { ...preselectedFood, calories: null, protein: null, fat: null, moisture: null, fiber: null, ash: null, phosphorusPer100kcal: null, calciumPer100kcal: null, calciumPhosphorusRatio: null, nutrition: null, createdAt: "", updatedAt: "" }
    : null;

  const [selectedFood, setSelectedFood] = useState<CannedFood | null>(initialFood);
  const [reaction, setReaction] = useState<CatReaction>(
    editing?.reaction ?? CatReaction.LIKED
  );
  const [rating, setRating] = useState<string>(
    editing?.rating?.toString() ?? ""
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [fedAt, setFedAt] = useState(
    editing?.fedAt
      ? editing.fedAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) {
      setError("請選擇罐頭");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data: CreateFeedingRecordInput = {
        cannedFoodId: selectedFood.id,
        reaction,
        rating: rating ? Number(rating) : undefined,
        note: note.trim() || undefined,
        fedAt,
      };

      const record = editing
        ? await updateFeedingRecord(catId, editing.id, data)
        : await createFeedingRecord(catId, data);

      onSaved(record);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "編輯餵食紀錄" : "新增餵食紀錄"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* 罐頭選擇：編輯時鎖定不可更換 */}
          <div className="space-y-1">
            <label className="text-sm font-medium">罐頭 *</label>
            {editing ? (
              <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/40">
                {editing.cannedFood.imageUrl ? (
                  <img
                    src={editing.cannedFood.imageUrl}
                    alt={editing.cannedFood.productName}
                    className="w-10 h-10 object-cover rounded border shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded border bg-muted shrink-0 flex items-center justify-center text-lg">🥫</div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{editing.cannedFood.brandName}</p>
                  <p className="text-xs text-muted-foreground truncate">{editing.cannedFood.productName}</p>
                </div>
              </div>
            ) : (
              <CannedFoodPicker value={selectedFood} onChange={setSelectedFood} />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">貓咪反應 *</label>
            <div className="flex flex-wrap gap-2">
              {REACTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReaction(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-colors",
                    reaction === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                  )}
                >
                  {REACTION_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">評分（選填，1-5）</label>
            <Input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="1-5"
              min={1}
              max={5}
              step={1}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">備註（選填）</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例：生病時才肯吃、換糧過渡期"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">餵食日期</label>
            <Input
              type="date"
              value={fedAt}
              onChange={(e) => setFedAt(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !selectedFood}>
              {loading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
