"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReactionBadge } from "./ReactionBadge";
import { FeedingRecordFormDialog } from "./FeedingRecordFormDialog";
import { deleteFeedingRecord } from "@/lib/api";
import type { FeedingRecord } from "@/lib/types";

interface FeedingRecordListProps {
  catId: number;
  records: FeedingRecord[];
  onRecordChanged: (record: FeedingRecord) => void;
  onRecordDeleted: (id: number) => void;
}

export function FeedingRecordList({
  catId,
  records,
  onRecordChanged,
  onRecordDeleted,
}: FeedingRecordListProps) {
  const [editingRecord, setEditingRecord] = useState<FeedingRecord | null>(null);

  const handleDelete = async (record: FeedingRecord) => {
    if (!confirm(`確認刪除此筆紀錄？`)) return;
    try {
      await deleteFeedingRecord(catId, record.id);
      onRecordDeleted(record.id);
    } catch {
      alert("刪除失敗，請重試");
    }
  };

  if (records.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        還沒有餵食紀錄，點擊「新增紀錄」開始記錄吧！
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {record.cannedFood.imageUrl && (
                  <img
                    src={record.cannedFood.imageUrl}
                    alt={record.cannedFood.productName}
                    className="w-12 h-12 object-cover rounded border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {record.cannedFood.brandName} · {record.cannedFood.productName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <ReactionBadge reaction={record.reaction} />
                    {record.rating && (
                      <Badge variant="outline">⭐ {record.rating}/5</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.fedAt).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                  {record.note && (
                    <p className="text-sm text-muted-foreground mt-1">{record.note}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRecord(record)}
                  >
                    編輯
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(record)}
                  >
                    刪除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRecord && (
        <FeedingRecordFormDialog
          open
          catId={catId}
          editing={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSaved={(updated) => {
            onRecordChanged(updated);
            setEditingRecord(null);
          }}
        />
      )}
    </>
  );
}
