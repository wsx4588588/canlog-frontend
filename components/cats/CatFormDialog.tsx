"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageCropDialog } from "./ImageCropDialog";
import { createCat, updateCat, uploadCatAvatar } from "@/lib/api";
import type { Cat } from "@/lib/types";

interface CatFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (cat: Cat) => void;
  editing?: Cat;
}

export function CatFormDialog({
  open,
  onClose,
  onSaved,
  editing,
}: CatFormDialogProps) {
  const [name, setName] = useState(editing?.name ?? "");
  // 裁切後的 File（WebP），準備上傳
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 顯示用預覽（裁切後的 object URL 或已存的 URL）
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    editing?.avatarUrl ?? null
  );
  // 選圖後待裁切的原始 object URL
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 開啟裁切 dialog
    setCropSrc(URL.createObjectURL(file));
    // 清空 input value 讓同一張圖能重新選
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File, croppedPreview: string) => {
    setImageFile(croppedFile);
    setPreviewUrl(croppedPreview);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let avatarUrl: string | undefined = editing?.avatarUrl ?? undefined;

      if (imageFile) {
        // imageFile 已是裁切後的 WebP，直接上傳
        avatarUrl = await uploadCatAvatar(imageFile);
      } else if (!previewUrl) {
        // 使用者移除了照片
        avatarUrl = undefined;
      }

      const data = { name: name.trim(), avatarUrl };
      const cat = editing
        ? await updateCat(editing.id, data)
        : await createCat(data);
      onSaved(cat);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "編輯貓咪" : "新增貓咪"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">貓咪名字 *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：橘子"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">貓咪照片（選填）</label>
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="預覽"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl border">
                    🐱
                  </div>
                )}
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? "重新選擇" : "選擇圖片"}
                  </Button>
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground block"
                      onClick={handleRemoveImage}
                    >
                      移除
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    JPG、PNG、WEBP，最大 5MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "上傳並儲存..." : "儲存"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  );
}
