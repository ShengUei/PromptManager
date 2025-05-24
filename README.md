# 🚀 Prompt Manager - 智能Prompt管理瀏覽器擴展

一個專為AI時代打造的瀏覽器擴展，支持Chrome、Edge等主流瀏覽器，讓您能夠高效管理和快速插入常用的prompt模板到任何網頁的輸入框中。特別適用於ChatGPT、Claude、Gemini等AI對話平台。

## ✨ 核心功能

### 📚 智能Prompt管理
- **完整CRUD操作**：添加、編輯、刪除、複製prompt模板
- **分類組織系統**：按用途分類管理（通用、翻譯、編程、學習等）
- **即時搜索過濾**：快速找到所需的prompt模板
- **批量數據管理**：支持JSON格式導入導出，便於備份和分享

### 🎯 多種插入方式
- **右鍵菜單插入**：在任何輸入框右鍵選擇prompt直接插入
- **擴展彈窗**：點擊瀏覽器工具欄圖標，透過美觀界面選擇prompt
- **智能複製**：自動複製到剪貼簿，支援手動貼上

### 💾 可靠的存儲機制
- **雙重存儲**：Chrome擴展API + localStorage雙重保障
- **跨瀏覽器相容**：智能檢測並使用最佳存儲方式
- **自動備份**：本地存儲確保數據安全
- **數據遷移**：支援不同瀏覽器間的數據遷移

## 🌐 瀏覽器支持

### ✅ 完全支持
- **Google Chrome** (Manifest V3, 版本88+)
- **Microsoft Edge** (Manifest V3, 版本88+)

## 📦 安裝方式

### Chrome/Edge 安裝

1. **下載或複製專案**
   ```powershell
   git clone https://github.com/ShengUei/PromptManager.git
   cd PromptManager
   ```

2. **開啟擴展管理頁面**
   - Chrome: 導航至 `chrome://extensions/`
   - Edge: 導航至 `edge://extensions/`

3. **啟用開發者模式**
   - 在擴展管理頁面右上角開啟「開發者模式」

4. **載入擴展**
   - 點擊「載入未封裝項目」
   - 選擇專案資料夾
   - 確認擴展已成功載入

## 🚀 快速開始

### 初次使用設定

1. **安裝完成後**，瀏覽器工具欄會出現Prompt Manager圖標
2. **點擊圖標**開啟彈窗界面
3. **點擊「管理Prompt」**進入設定頁面
4. **探索預設模板**：系統已預載了5個實用的prompt模板：
   - 摘要文章內容
   - 翻譯成繁體中文/英文
   - 解釋概念
   - 程式碼審查請求

### 使用方法詳解

#### 方法1：右鍵菜單插入
1. 在任何網頁的**文字輸入框**中右鍵
2. 選擇「**插入Prompt**」選項
3. 從子選單中選擇所需的prompt
4. prompt內容**立即插入**到輸入框中

#### 方法3：擴展彈窗
1. 點擊瀏覽器工具欄的Prompt Manager圖標
2. 在彈窗中**搜索**或直接**點擊**prompt
3. prompt自動**複製到剪貼簿**
4. 手動貼上到任何位置 (Ctrl+V)

## 📝 Prompt管理

### 新增自訂Prompt

1. **進入管理頁面**：
   - 點擊擴展彈窗中的「管理Prompt」按鈕
   - 或右鍵擴展圖標選擇「選項」

2. **填寫Prompt資訊**：
   - **標題**（必填）：為prompt取一個清楚的名稱
   - **分類**（選填）：可選擇現有分類或創建新分類
   - **內容**（必填）：輸入完整的prompt文字

3. **儲存**：點擊「儲存Prompt」按鈕

### 進階管理功能

- **編輯Prompt**：點擊prompt項目的「編輯」按鈕
- **複製Prompt**：點擊「複製」按鈕建立副本，方便創建變化版本
- **刪除Prompt**：點擊「刪除」按鈕並確認
- **搜索過濾**：使用搜索框按標題或內容快速篩選
- **分類篩選**：下拉選單按分類篩選prompt

### 數據備份與還原

#### 導出備份
1. 在管理頁面點擊「**導出Prompts**」按鈕
2. 下載JSON格式的完整備份檔案
3. 建議定期備份以防數據遺失

#### 導入還原
1. 點擊「**導入Prompts**」按鈕
2. 選擇先前導出的JSON檔案
3. 導入的prompts會與現有資料**合併**（不會覆蓋）

## 🎯 適用場景與網站

### 🤖 AI對話平台
- **ChatGPT** (OpenAI)
- **Claude** (Anthropic)  
- **Gemini** (Google)
- **Grok** (xAI)

### 💬 社交與通訊
- **Twitter/X**、**Facebook**

## 🔧 技術架構

### 檔案結構
```
PromptManager/
├── manifest.json              # Chrome/Edge擴展配置 (Manifest V3)
├── manifest-v2.json           # Firefox擴展配置 (Manifest V2)
├── background.js              # Chrome V3 Service Worker
├── background-v2.js           # Firefox V2 背景腳本
├── storage.js                 # 跨瀏覽器存儲管理器
├── content.js                 # 內容腳本（頁面注入）
├── popup.html/js              # 擴展彈窗界面
├── options.html/js            # 設定頁面
├── init-prompts.js            # 預設prompt模板
├── icons/                     # 圖標資源
│   └── icon.svg              # SVG向量圖標
└── package.json              # 專案配置
```

### 核心技術特點

- **🔄 雙manifest支援**：同時相容Manifest V2/V3標準
- **💾 智能存儲**：Chrome Extension API + localStorage雙重保障  
- **🌐 跨瀏覽器**：自動檢測環境並使用最適API
- **⚡ 輕量無依賴**：純JavaScript實現，體積小巧
- **🎨 響應式設計**：適配各種螢幕尺寸
- **🛡️ 容錯機制**：多層次錯誤處理與優雅降級

### 權限說明

本擴展需要以下權限來提供完整功能：

- **`storage`** - 儲存prompt數據
- **`activeTab`** - 存取當前標籤頁以插入prompt
- **`contextMenus`** - 建立右鍵選單選項
- **`scripting`** - 在網頁中執行內容腳本以偵測輸入框
- **`clipboardWrite`** - 複製prompt到剪貼簿
- **`host_permissions`** - 在所有網站運行以偵測輸入框

## 💾 存儲機制詳解

### 🔧 存儲方式
- **主要存儲**：Chrome Extensions Storage API（同步）
- **備用存儲**：瀏覽器localStorage API（本地）
- **自動檢測**：智能選擇最佳存儲方式
- **容量支援**：最多約5-10MB（足夠數千個prompt）

### 📍 存儲位置
- **Windows**: `%LOCALAPPDATA%\[Browser]\User Data\Default\Local Storage\`
- **macOS**: `~/Library/Application Support/[Browser]/Default/Local Storage/`
- **Linux**: `~/.config/[Browser]/Default/Local Storage/`

### 🔄 數據遷移
- **自動備份**：每次導出都包含完整數據結構
- **跨瀏覽器遷移**：透過JSON匯入匯出功能
- **版本升級**：向後相容，自動遷移舊格式數據
