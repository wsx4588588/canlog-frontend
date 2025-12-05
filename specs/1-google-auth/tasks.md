# Tasks: 前端串接 Google 登入

**Input**: Design documents from `/specs/1-google-auth/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可平行執行（不同檔案、無依賴）
- **[Story]**: 對應的 User Story（US1, US2, US3...）
- 包含確切的檔案路徑

---

## Phase 1: Setup（基礎設施）

**Purpose**: 建立型別定義、API 函數、認證 Context

- [x] T001 建立認證相關型別定義 `types/auth.ts`
- [x] T002 [P] 建立認證 API 函數 `lib/auth-api.ts`
- [x] T003 建立 AuthContext 和 AuthProvider `contexts/AuthContext.tsx`
- [x] T004 建立 useAuth Hook `hooks/useAuth.ts`
- [x] T005 在 `app/layout.tsx` 包裹 AuthProvider

**Checkpoint**: 基礎設施完成，可開始實作 User Stories

---

## Phase 2: User Story 1 & 2 - 核心登入功能 (Priority: P1) 🎯 MVP

**Goal**: 使用者可以點擊按鈕登入，並在成功後看到登入狀態

**Independent Test**: 完成 Google 授權後，Header 顯示使用者資訊

### Implementation for US1 & US2

- [x] T006 [P] [US1] 建立 GoogleLoginButton 元件 `components/auth/GoogleLoginButton.tsx`
- [x] T007 [P] [US2] 建立登入成功頁面 `app/auth/success/page.tsx`
- [x] T008 [US1] 修改 Header 整合 GoogleLoginButton `components/layout/header.tsx`

**Checkpoint**: 使用者可以完成登入流程，Header 根據登入狀態顯示不同內容

---

## Phase 3: User Story 3 & 4 - 登出與錯誤處理 (Priority: P2)

**Goal**: 使用者可以登出，且錯誤情況有適當處理

**Independent Test**: 點擊登出後狀態重置；訪問 /auth/error 顯示錯誤訊息

### Implementation for US3 & US4

- [x] T009 [P] [US3] 建立登入失敗頁面 `app/auth/error/page.tsx`
- [x] T010 [P] [US4] 建立 UserMenu 元件（含登出功能）`components/auth/UserMenu.tsx`
- [x] T011 [US4] 修改 Header 整合 UserMenu `components/layout/header.tsx`

**Checkpoint**: 登入/登出流程完整，錯誤有適當處理

---

## Phase 4: User Story 5 - 使用者資訊自動載入 (Priority: P2)

**Goal**: 頁面載入時自動檢查登入狀態並顯示使用者資訊

**Independent Test**: 重新整理頁面後，已登入使用者自動識別

### Implementation for US5

- [x] T012 [US5] 在 AuthProvider 加入自動檢查登入狀態邏輯 `contexts/AuthContext.tsx`
- [x] T013 [US5] 確保 Header 正確顯示使用者頭像和名稱 `components/layout/header.tsx`

**Checkpoint**: 完整的認證流程，包含自動狀態恢復

---

## Phase 5: Polish & 優化

**Purpose**: 最終調整和邊界案例處理

- [x] T014 [P] 加入 Loading 狀態 UI（登入/登出進行中）
- [x] T015 [P] 加入錯誤處理（網路錯誤、API 錯誤）
- [ ] T016 執行 quickstart.md 驗證清單

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 無依賴 - 立即開始
- **Phase 2 (US1 & US2)**: 依賴 Phase 1 完成
- **Phase 3 (US3 & US4)**: 依賴 Phase 2 完成
- **Phase 4 (US5)**: 依賴 Phase 3 完成
- **Phase 5 (Polish)**: 依賴所有 User Stories 完成

### 平行執行機會

```bash
# Phase 1 - 可平行
T001, T002 可同時進行

# Phase 2 - 可平行
T006, T007 可同時進行

# Phase 3 - 可平行
T009, T010 可同時進行

# Phase 5 - 可平行
T014, T015 可同時進行
```

---

## Implementation Strategy

### MVP First (只完成 Phase 1 & 2)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: US1 & US2
3. **STOP and VALIDATE**: 測試登入流程
4. 可部署/展示 MVP

### 完整實作

1. Phase 1 → Phase 2 → **驗證 MVP**
2. Phase 3 → Phase 4 → **驗證完整流程**
3. Phase 5 → **最終驗證**

---

## Task Summary

| Phase | Tasks     | 說明           |
| ----- | --------- | -------------- |
| 1     | T001-T005 | 基礎設施       |
| 2     | T006-T008 | 核心登入 (MVP) |
| 3     | T009-T011 | 登出與錯誤     |
| 4     | T012-T013 | 自動載入       |
| 5     | T014-T016 | 優化           |

**Total**: 16 tasks
**MVP**: 8 tasks (Phase 1 + 2)
