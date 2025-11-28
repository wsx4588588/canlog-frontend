# CanLog Frontend

寵物罐頭營養分析前端應用

## 技術棧

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## 需求

- Node.js >= 22.0.0
- pnpm >= 9.0.0

## 安裝

```bash
pnpm install
```

## 環境設定

建立 `.env.local`：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 執行

```bash
# 開發模式
pnpm dev
```

開啟 http://localhost:3000

## 建置

```bash
pnpm build
pnpm start
```

## 頁面

| 路徑 | 說明 |
|------|------|
| `/` | 罐頭列表頁面 |
| `/upload` | 圖片上傳分析頁面 |
| `/canned-foods/[id]` | 罐頭詳情頁面 |
