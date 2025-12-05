# Feature Specification: 前端串接 Google 登入

**Feature Branch**: `1-google-auth`  
**Created**: 2025-12-01  
**Status**: Draft  
**Input**: 前端串接 Google 登入，與後端 OAuth API 整合

## User Scenarios & Testing

### User Story 1 - Google 登入按鈕 (Priority: P1)

使用者可以透過點擊 Google 登入按鈕來進行身份驗證，系統會將使用者導向 Google 授權頁面。

**Why this priority**: 這是登入功能的入口點，沒有這個按鈕使用者無法開始登入流程。

**Independent Test**: 點擊按鈕後，瀏覽器會被導向至後端的 `/api/auth/google` 端點。

**Acceptance Scenarios**:

1. **Given** 使用者在首頁或任何需要登入的頁面，**When** 點擊「使用 Google 登入」按鈕，**Then** 瀏覽器導向至 `http://localhost:3001/api/auth/google`
2. **Given** 使用者已經登入，**When** 查看頁面，**Then** 不應顯示登入按鈕，而是顯示使用者資訊

---

### User Story 2 - 登入成功處理 (Priority: P1)

使用者完成 Google 授權後，系統接收後端回傳的認證資訊並更新應用程式狀態。

**Why this priority**: 這是完成登入流程的關鍵步驟，與登入按鈕同等重要。

**Independent Test**: 訪問 `/auth/success` 頁面時，能正確讀取 Cookie 中的 Token 並更新登入狀態。

**Acceptance Scenarios**:

1. **Given** 使用者完成 Google 授權，**When** 被導向至 `/auth/success`，**Then** 系統讀取 Cookie 中的 access_token 並將使用者狀態設為已登入
2. **Given** 使用者登入成功，**When** 系統更新狀態後，**Then** 自動導向至首頁或原本要訪問的頁面
3. **Given** Cookie 中沒有有效的 Token，**When** 訪問 `/auth/success`，**Then** 顯示錯誤訊息並提供重新登入選項

---

### User Story 3 - 登入失敗處理 (Priority: P2)

當 Google 授權失敗或被使用者取消時，系統顯示適當的錯誤訊息。

**Why this priority**: 錯誤處理是良好使用者體驗的一部分，但不影響核心登入功能。

**Independent Test**: 訪問 `/auth/error` 頁面時，顯示錯誤訊息和重試選項。

**Acceptance Scenarios**:

1. **Given** 使用者取消 Google 授權，**When** 被導向至 `/auth/error`，**Then** 顯示「登入已取消」訊息
2. **Given** 發生授權錯誤，**When** 被導向至 `/auth/error?error=xxx`，**Then** 顯示對應的錯誤訊息
3. **Given** 使用者在錯誤頁面，**When** 點擊「重新登入」，**Then** 導向至登入頁面

---

### User Story 4 - 登出功能 (Priority: P2)

使用者可以登出系統，清除所有認證狀態。

**Why this priority**: 登出是完整認證流程的一部分，但優先於登入功能之後。

**Independent Test**: 點擊登出按鈕後，Cookie 被清除且使用者狀態重置。

**Acceptance Scenarios**:

1. **Given** 使用者已登入，**When** 點擊「登出」按鈕，**Then** 呼叫後端 `/api/auth/logout` API
2. **Given** 登出 API 回應成功，**When** 處理回應，**Then** 清除本地狀態並導向至首頁
3. **Given** 使用者已登出，**When** 查看頁面，**Then** 顯示登入按鈕而非使用者資訊

---

### User Story 5 - 取得使用者資訊 (Priority: P2)

系統可以取得並顯示目前登入使用者的基本資訊。

**Why this priority**: 顯示使用者資訊是驗證登入成功的方式，增強使用者體驗。

**Independent Test**: 呼叫 `/api/auth/profile` API 能取得使用者資料。

**Acceptance Scenarios**:

1. **Given** 使用者已登入（Cookie 中有 access_token），**When** 呼叫取得使用者資訊 API，**Then** 回傳使用者的 email、名稱、頭像等資訊
2. **Given** 使用者已登入，**When** 頁面載入，**Then** Header 顯示使用者名稱和頭像
3. **Given** Token 過期或無效，**When** 呼叫 API，**Then** 回傳 401 錯誤並觸發重新登入流程

---

### Edge Cases

- 使用者在 Google 授權頁面停留過久導致 session 過期
- 使用者使用多個分頁同時進行登入
- 網路中斷時的錯誤處理
- Token 在使用過程中過期的處理

## Requirements

### Functional Requirements

- **FR-001**: 系統 MUST 提供 Google 登入按鈕，點擊後導向後端 OAuth 端點
- **FR-002**: 系統 MUST 處理 `/auth/success` 路由，讀取 Cookie 並更新登入狀態
- **FR-003**: 系統 MUST 處理 `/auth/error` 路由，顯示錯誤訊息
- **FR-004**: 系統 MUST 提供登出功能，呼叫後端 API 並清除本地狀態
- **FR-005**: 系統 MUST 能取得並顯示目前登入使用者的資訊
- **FR-006**: 系統 MUST 在未登入時隱藏需要認證的功能
- **FR-007**: 系統 MUST 在 Token 無效時自動導向登入頁面

### Key Entities

- **User/Member**: 代表已登入的使用者，包含 email、displayName、avatarUrl 等屬性
- **AuthState**: 前端認證狀態，包含 isAuthenticated、user、isLoading 等屬性

## Success Criteria

### Measurable Outcomes

- **SC-001**: 使用者可以在 3 次點擊內完成 Google 登入流程
- **SC-002**: 登入成功後，使用者資訊在 1 秒內顯示於 Header
- **SC-003**: 登出後，所有認證相關狀態在 500ms 內清除
- **SC-004**: 錯誤頁面提供清晰的錯誤訊息和重試選項
- **SC-005**: 90% 的使用者能在首次嘗試時成功完成登入
