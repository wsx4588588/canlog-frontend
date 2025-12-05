# Implementation Plan: 前端串接 Google 登入

**Branch**: `1-google-auth` | **Date**: 2025-12-01 | **Spec**: [spec.md](./spec.md)

## Summary

實作前端 Google OAuth 登入功能，包含登入按鈕、成功/失敗頁面處理、使用者狀態管理，與後端 NestJS OAuth API 整合。

## Technical Context

**Language/Version**: TypeScript 5.x  
**Framework**: Next.js 14 (App Router)  
**UI Library**: Tailwind CSS + shadcn/ui  
**State Management**: React Context（認證狀態）  
**API Communication**: Fetch API with credentials  
**Target Platform**: Web Browser

## Constitution Check

_GATE: 檢查是否符合專案原則_

| 原則         | 狀態 | 說明                                     |
| ------------ | ---- | ---------------------------------------- |
| MVP 優先     | ✅   | 只實作核心登入/登出功能                  |
| 禁止過度設計 | ✅   | 使用 React Context，不引入額外狀態管理庫 |
| 可測試性     | ✅   | 邏輯抽離至 hooks，元件可獨立測試         |
| 正體中文     | ✅   | UI 文字使用正體中文                      |

## Project Structure

### 新增檔案

```
app/
├── auth/
│   ├── success/
│   │   └── page.tsx          # 登入成功處理頁面
│   └── error/
│       └── page.tsx          # 登入失敗處理頁面
├── (protected)/              # 需要認證的路由群組（未來擴充）
│   └── layout.tsx

components/
├── auth/
│   ├── GoogleLoginButton.tsx # Google 登入按鈕
│   ├── UserMenu.tsx          # 使用者選單（頭像+登出）
│   └── AuthGuard.tsx         # 認證守衛元件

hooks/
├── useAuth.ts                # 認證狀態 Hook

contexts/
├── AuthContext.tsx           # 認證 Context Provider

lib/
├── auth-api.ts               # 認證相關 API 呼叫

types/
├── auth.ts                   # 認證相關型別定義
```

### 修改檔案

```
components/layout/header.tsx  # 整合 UserMenu / GoogleLoginButton
app/layout.tsx                # 包裹 AuthProvider
```

## Data Model

### User Type

```typescript
interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: "google";
  createdAt: string;
}
```

### AuthState Type

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}
```

## API Contracts

### 後端 API（已存在）

| Method | Endpoint                    | Description | Request | Response              |
| ------ | --------------------------- | ----------- | ------- | --------------------- |
| GET    | `/api/auth/google`          | 發起 OAuth  | -       | Redirect to Google    |
| GET    | `/api/auth/google/callback` | OAuth 回調  | -       | Redirect + Set Cookie |
| POST   | `/api/auth/logout`          | 登出        | Cookie  | `{ success: true }`   |
| GET    | `/api/auth/profile`         | 取得使用者  | Cookie  | `User` object         |

### Cookie 說明

- `access_token`: JWT Token，httpOnly
- `refresh_token`: 重新整理 Token，httpOnly

前端透過 `credentials: 'include'` 自動帶入 Cookie。

## Implementation Phases

### Phase 1: 基礎設施 (Setup)

1. 建立型別定義 `types/auth.ts`
2. 建立 API 函數 `lib/auth-api.ts`
3. 建立 AuthContext 和 AuthProvider

### Phase 2: User Story 1 & 2 (P1 - 核心登入)

1. 建立 GoogleLoginButton 元件
2. 建立 `/auth/success` 頁面
3. 整合 Header 顯示登入按鈕

### Phase 3: User Story 3 & 4 (P2 - 登出與錯誤處理)

1. 建立 `/auth/error` 頁面
2. 建立 UserMenu 元件（含登出功能）
3. 整合 Header 顯示使用者資訊

### Phase 4: User Story 5 (P2 - 使用者資訊)

1. 實作 useAuth hook 的自動取得使用者功能
2. 頁面載入時自動檢查登入狀態

## Complexity Tracking

無需額外複雜度，使用 React 內建功能即可滿足需求。

## Notes

- Cookie 由後端設定，前端只需在 API 呼叫時帶入 `credentials: 'include'`
- 不需要在前端儲存 Token，完全依賴 httpOnly Cookie
- 使用 Next.js App Router，頁面元件預設為 Server Component，需要標記 `'use client'`
