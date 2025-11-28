# CanLog Frontend Constitution

## Core Principles

### I. MVP 優先

所有功能開發 MUST 以最小可行產品為目標：
- 優先實現核心功能，避免功能蔓延
- 每個功能 MUST 有明確的使用者價值
- 延遲非必要功能至後續迭代

### II. 禁止過度設計 (YAGNI)

You Aren't Gonna Need It：
- 禁止為「未來可能需要」的情境預先設計
- 禁止建立沒有立即使用場景的抽象層
- 複雜度 MUST 與當前需求成正比
- 重構優於預測性設計

### III. 可測試性

所有程式碼 MUST 可被測試：
- 業務邏輯 MUST 與外部依賴解耦
- 元件 MUST 支援單元測試
- 關鍵使用者流程 MUST 可被端對端測試

### IV. 註解規範

註解 MUST 僅用於以下情境：
- 表達 Domain Know-How（領域知識）
- 說明開發意圖與設計決策
- 解釋非直覺的業務邏輯

禁止的註解：
- 描述程式碼「做什麼」（程式碼本身應自解釋）
- TODO/FIXME 等待辦事項（使用 Issue Tracker）
- 註解掉的程式碼（使用版本控制）

### V. 正體中文

所有文件、註解、commit message MUST 使用正體中文：
- 技術專有名詞可保留英文原文
- 變數名稱、函數名稱使用英文
- UI 文字、錯誤訊息使用正體中文

## 開發約束

### 技術選型

- 框架：Next.js 14 (App Router) + TypeScript
- 樣式：Tailwind CSS + shadcn/ui
- 套件管理：pnpm
- Node.js 版本：22+

### 依賴管理

- 新增依賴 MUST 有明確理由
- 優先使用已存在的依賴解決問題
- 禁止引入功能重疊的套件

## 程式碼品質

### 命名規範

- 變數、函數：camelCase
- 元件：PascalCase
- 常數：UPPER_SNAKE_CASE
- 檔案：kebab-case（元件除外，元件使用 PascalCase）

### 元件設計

- 元件 MUST 職責單一
- 複雜邏輯 MUST 抽離至 hooks 或 utils
- 樣式 MUST 使用 Tailwind CSS 類別

### 錯誤處理

- 所有 API 呼叫 MUST 有錯誤處理
- 錯誤訊息 MUST 對使用者友善
- 網路錯誤 MUST 有重試機制或提示

## Governance

本 Constitution 為專案最高指導原則：
- 所有 PR MUST 符合上述原則
- 原則衝突時，優先順序：可測試性 > MVP 優先 > 禁止過度設計
- 修訂 Constitution 需記錄變更原因與影響範圍

**Version**: 1.0.0 | **Ratified**: 2025-11-27 | **Last Amended**: 2025-11-27
