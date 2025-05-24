# 🚀 Prompt Manager - 跨瀏覽器插件

一個強大的瀏覽器擴展，支持Chrome、Firefox、Edge、Safari等多種瀏覽器，幫助您管理和快速插入常用的prompt到任何網頁的輸入框中。

## ✨ 功能特色

### 📝 Prompt管理
- **添加、編輯、刪除**：完整的prompt生命週期管理
- **分類組織**：為prompt設置分類，更好地組織內容
- **搜索過濾**：快速找到需要的prompt
- **批量操作**：支持複製、導入、導出prompt

### 🎯 快速插入
- **右鍵菜單**：在任何輸入框右鍵選擇prompt
- **智能識別**：自動識別常見的對話框和輸入框
- **彈窗界面**：點擊擴展圖標快速選擇prompt

### 💾 數據管理
- **本地存儲**：使用localStorage，支持所有瀏覽器
- **跨瀏覽器**：支持Chrome、Firefox、Edge、Safari
- **導入導出**：支持JSON格式的數據備份和恢復
- **分類統計**：顯示prompt數量和分類統計

## 🌐 瀏覽器支持

### ✅ 完全支持
- **Google Chrome** (版本88+)
- **Microsoft Edge** (版本88+)
- **Mozilla Firefox** (版本78+)
- **Safari** (版本14+)
- **Opera** (版本74+)

### 📦 安裝方式

#### Chrome/Edge 安裝
1. 使用 `manifest.json` (Manifest V3)
2. 開發者模式載入

#### Firefox 安裝  
1. 使用 `manifest-v2.json` (Manifest V2)
2. 重命名為 `manifest.json`
3. 臨時載入附加組件

## 🚀 安裝指南

### Chrome/Edge 安裝

1. **下載源碼**
   ```powershell
   git clone [repository-url]
   cd WebTool
   ```

2. **打開擴展管理頁面**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. **啟用開發者模式**
   - 在擴展管理頁面右上角打開"開發者模式"開關

4. **載入擴展**
   - 點擊"載入已解壓的擴展程序"
   - 選擇項目文件夾 `WebTool`
   - 確認安裝

### Firefox 安裝

1. **準備Firefox版本**
   ```powershell
   # 重命名manifest文件
   mv manifest.json manifest-v3.json
   mv manifest-v2.json manifest.json
   ```

2. **打開調試頁面**
   - 訪問 `about:debugging`
   - 點擊"此Firefox"

3. **載入擴展**
   - 點擊"臨時載入附加組件"
   - 選擇 `manifest.json` 文件
   - 確認安裝

### Safari 安裝

1. **啟用開發者功能**
   - Safari → 偏好設置 → 高級 → 在菜單欄中顯示"開發"菜單

2. **載入擴展**
   - 開發 → 允許未簽名的擴展
   - 將項目文件夾拖到Safari中

## 📖 使用說明

### 初次設置

1. **點擊擴展圖標**：在Chrome工具欄點擊Prompt Manager圖標
2. **管理Prompt**：點擊"管理Prompt"按鈕進入設置頁面
3. **添加第一個Prompt**：
   - 填寫標題（必填）
   - 選擇分類（可選）
   - 輸入prompt內容（必填）
   - 點擊"保存Prompt"

### 使用方法

#### 方法1：右鍵菜單
1. 在任何網頁的輸入框中右鍵
2. 選擇"插入Prompt" → 選擇具體的prompt
3. prompt自動插入到輸入框中

#### 方法2：擴展彈窗
1. 點擊Chrome工具欄的擴展圖標
2. 在彈窗中搜索或直接點擊prompt
3. **prompt自動複製到剪貼簿**，然後手動貼上到需要的位置

### 管理Prompt

1. **添加新Prompt**：
   - 標題：為prompt起一個容易記住的名稱
   - 分類：可以創建分類來組織prompt（如：通用、開發、寫作等）
   - 內容：輸入完整的prompt文字

2. **編輯Prompt**：
   - 在prompt列表中點擊"編輯"按鈕
   - 修改後點擊"更新Prompt"

3. **刪除Prompt**：
   - 點擊"刪除"按鈕並確認

4. **複製Prompt**：
   - 點擊"複製"按鈕創建副本

### 數據備份

1. **導出Prompt**：
   - 在設置頁面底部點擊"導出Prompts"
   - 下載JSON格式的備份文件

2. **導入Prompt**：
   - 點擊"導入Prompts"
   - 選擇之前導出的JSON文件
   - 導入的prompt會與現有prompt合併

## 🎨 支持的網站

這個擴展支持幾乎所有網站的輸入框，包括但不限於：

- **AI聊天網站**：ChatGPT、Claude、Gemini等
- **社交媒體**：Twitter、Facebook、LinkedIn等  
- **郵件服務**：Gmail、Outlook等
- **論壇網站**：Reddit、Stack Overflow等
- **寫作平台**：Medium、WordPress等
- **開發工具**：GitHub、GitLab等

## 💾 存儲機制

### 🔧 存儲方式
- **主要存儲**：瀏覽器的localStorage API
- **備用存儲**：Chrome擴展storage API（如果可用）
- **跨平台**：所有現代瀏覽器都支持localStorage
- **容量限制**：約5-10MB，足夠存儲大量prompt

### 📍 存儲位置
- **Windows**: `%LOCALAPPDATA%\[Browser]\User Data\Default\Local Storage\`
- **macOS**: `~/Library/Application Support/[Browser]/Default/Local Storage/`
- **Linux**: `~/.config/[Browser]/Default/Local Storage/`

### 🔄 數據遷移
- **自動備份**：每次導出都包含完整數據
- **跨瀏覽器**：通過導入/導出在不同瀏覽器間遷移
- **版本升級**：向後兼容，自動遷移舊數據

## 🛠️ 技術特點

- **Manifest V3/V2**：同時支持新舊標準
- **跨瀏覽器API**：自動檢測並使用合適的API
- **輕量級**：純JavaScript實現，無外部依賴
- **響應式**：適配不同屏幕尺寸
- **容錯性**：存儲失敗時優雅降級
- **性能優化**：智能的元素檢測和事件處理

## 📋 權限說明

這個擴展請求以下權限：

- `storage`：存儲prompt數據並同步到雲端
- `activeTab`：訪問當前標籤頁以插入prompt
- `contextMenus`：創建右鍵菜單選項
- `scripting`：在網頁中執行內容腳本
- `host_permissions`：在所有網站運行以檢測輸入框

## 🛠️ 開發

### 項目結構
```
WebTool/
├── manifest.json           # Chrome/Edge擴展配置 (V3)
├── manifest-v2.json        # Firefox擴展配置 (V2)
├── background.js           # Chrome V3背景腳本
├── background-v2.js        # Firefox V2背景腳本
├── storage.js              # 跨瀏覽器存儲管理器
├── content.js              # 內容腳本
├── popup.html/js           # 彈窗界面
├── options.html/js         # 設置頁面
├── icons/                  # 圖標文件
└── README.md              # 說明文檔
```

### 調試

1. **背景腳本調試**：
   - 在 `chrome://extensions/` 中點擊"背景頁面"
   - 使用開發者工具調試

2. **內容腳本調試**：
   - 在任何網頁按F12打開開發者工具
   - 在Console中可以看到內容腳本的輸出

3. **彈窗調試**：
   - 右鍵擴展圖標選擇"檢查彈出內容"

## 🐛 常見問題

### Q: 為什麼prompt沒有插入？
A: 請確保：
- 輸入框已聚焦（點擊輸入框）
- 網站允許JavaScript執行
- 嘗試刷新頁面後重試

### Q: 如何同步到其他設備？
A: 確保Chrome已登錄同一個Google賬戶並啟用同步功能。

### Q: 可以備份prompt嗎？
A: 可以！在設置頁面使用導出功能創建JSON備份文件。

## 📝 更新日誌

### v1.0.0
- 初始版本發布
- 基本的prompt管理功能
- 右鍵菜單和快捷鍵支持
- 數據導入導出功能

## 🤝 貢獻

歡迎提交Issue和Pull Request來改進這個項目！

## 📄 許可證

MIT License

---

**開發者提示**：這是一個完整的Chrome擴展項目，包含了所有必要的文件和功能。您可以直接載入到Chrome中使用，也可以根據需要進行定制開發。
