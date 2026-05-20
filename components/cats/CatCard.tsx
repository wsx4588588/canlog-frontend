import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Cat } from "@/lib/types";

interface CatCardProps {
  cat: Cat;
  onEdit: (cat: Cat) => void;
  onDelete: (cat: Cat) => void;
}

export function CatCard({ cat, onEdit, onDelete }: CatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {cat.avatarUrl ? (
            <img
              src={cat.avatarUrl}
              alt={cat.name}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
              🐱
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{cat.name}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href={`/my-cats/${cat.id}`}>
              <Button variant="outline" size="sm">
                查看紀錄
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => onEdit(cat)}>
              編輯
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(cat)}
            >
              刪除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
