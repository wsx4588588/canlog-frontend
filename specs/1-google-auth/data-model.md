# Data Model: 前端串接 Google 登入

## Entities

### User

代表已登入的使用者資訊，從後端 `/api/auth/profile` API 取得。

```typescript
interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: "google";
  createdAt: string;
  updatedAt: string;
}
```

| Field       | Type     | Description         |
| ----------- | -------- | ------------------- |
| id          | number   | 使用者唯一識別碼    |
| email       | string   | Google 帳戶 Email   |
| displayName | string   | 顯示名稱            |
| avatarUrl   | string?  | Google 頭像 URL     |
| provider    | 'google' | OAuth 提供者        |
| createdAt   | string   | 建立時間 (ISO 8601) |
| updatedAt   | string   | 更新時間 (ISO 8601) |

### AuthState

前端認證狀態，用於 React Context。

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
```

| Field           | Type           | Description         |
| --------------- | -------------- | ------------------- |
| isAuthenticated | boolean        | 是否已登入          |
| user            | User \| null   | 使用者資訊          |
| isLoading       | boolean        | 是否正在載入/驗證中 |
| error           | string \| null | 錯誤訊息            |

### AuthContextValue

Context 提供的完整值，包含狀態和操作方法。

```typescript
interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

| Method      | Description          |
| ----------- | -------------------- |
| login()     | 導向 Google 登入頁面 |
| logout()    | 執行登出並清除狀態   |
| checkAuth() | 檢查並更新登入狀態   |

## State Transitions

```
初始狀態
    │
    ▼
┌─────────────────┐
│ isLoading: true │  ← 頁面載入，檢查登入狀態
│ user: null      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌────────────────┐
│ 未登入  │  │ 已登入          │
│        │  │ user: {...}    │
└───┬────┘  └───────┬────────┘
    │               │
    │ login()       │ logout()
    ▼               ▼
┌─────────────────────────────┐
│ 重導向至 Google / 後端處理    │
└─────────────────────────────┘
```

## API Response Types

### GET /api/auth/profile - Success

```typescript
// HTTP 200
{
  id: 1,
  email: "user@example.com",
  displayName: "使用者名稱",
  avatarUrl: "https://...",
  provider: "google",
  createdAt: "2025-12-01T00:00:00.000Z",
  updatedAt: "2025-12-01T00:00:00.000Z"
}
```

### GET /api/auth/profile - Unauthorized

```typescript
// HTTP 401
{
  statusCode: 401,
  message: "Unauthorized"
}
```

### POST /api/auth/logout - Success

```typescript
// HTTP 200
{
  success: true,
  message: "登出成功"
}
```
