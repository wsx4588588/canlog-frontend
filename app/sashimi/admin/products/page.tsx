"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Power } from "lucide-react";
import {
  listProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
  type SashimiProduct,
  type CreateProductInput,
} from "@/lib/sashimi-admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormState {
  name: string;
  category: string;
  unit: string;
  price: string;
  imageUrl: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  unit: "片",
  price: "",
  imageUrl: "",
  description: "",
};

export default function SashimiProductsPage() {
  const [products, setProducts] = useState<SashimiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SashimiProduct | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProducts(includeInactive);
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    reload();
  }, [reload]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(product: SashimiProduct) {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: String(product.price),
      imageUrl: product.imageUrl,
      description: product.description,
    });
    setError(null);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const priceNum = Number(form.price);
      if (!form.name || !form.category || !form.unit || !Number.isFinite(priceNum)) {
        throw new Error("請填妥所有必填欄位");
      }
      const payload: CreateProductInput = {
        name: form.name.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        price: priceNum,
        imageUrl: form.imageUrl.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setDialogOpen(false);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(product: SashimiProduct) {
    try {
      if (product.isActive) {
        if (!confirm(`確定要停售「${product.name}」？歷史訂單仍會顯示。`)) return;
        await softDeleteProduct(product.id);
      } else {
        await updateProduct(product.id, { isActive: true });
      }
      await reload();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">商品管理</h2>
          <p className="text-sm text-muted-foreground">
            SKU 自動產生，停售後仍保留歷史訂單引用
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground flex items-center gap-1">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
            />
            含停售
          </label>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            新增商品
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">SKU</TableHead>
              <TableHead>名稱</TableHead>
              <TableHead>分類</TableHead>
              <TableHead className="text-right">售價</TableHead>
              <TableHead>單位</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="w-32 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  載入中...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  尚無商品，點右上「新增商品」開始
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className={p.isActive ? "" : "opacity-60"}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {p.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    NT$ {p.price}
                  </TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>
                    {p.isActive ? (
                      <Badge variant="default">上架中</Badge>
                    ) : (
                      <Badge variant="secondary">停售</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(p)}
                        title={p.isActive ? "停售" : "重新上架"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "編輯商品" : "新增商品"}</DialogTitle>
            <DialogDescription>
              {editing
                ? `SKU: ${editing.sku}（不可修改）`
                : "SKU 會自動產生為下一個 P00X"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field label="名稱 *">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="挪威鮭魚"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="分類 *">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="鮭魚"
                />
              </Field>
              <Field label="單位 *">
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="片"
                />
              </Field>
            </div>
            <Field label="預設售價 *">
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="150"
              />
            </Field>
            <Field label="圖片網址（選填）">
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="描述（選填）">
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="肥美厚切"
              />
            </Field>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "儲存中..." : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
