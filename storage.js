// 通用存儲管理器 - 支持所有瀏覽器（Service Worker 相容版本）

// 使用函數式方法創建 StorageManager，避免 Service Worker 中的 class 構造問題
function createStorageManager() {
  const storageManager = {
    storageKey: 'promptManager_prompts',
    defaultPrompts: [],
    
    // 初始化存儲管理器
    initialize: async function() {
      console.log('StorageManager: Initializing...');
      // 僅依賴全域變數，不做硬編碼 fallback
      this.defaultPrompts = (typeof globalThis !== 'undefined' && globalThis.defaultPromptsFromInit) ||
                            (typeof window !== 'undefined' && window.defaultPromptsFromInit) ||
                            (typeof self !== 'undefined' && self.defaultPromptsFromInit) ||
                            [];
      if (!this.defaultPrompts || this.defaultPrompts.length === 0) {
        console.warn('StorageManager: defaultPromptsFromInit 未正確載入，請確認 init-prompts.js 有被正確注入！');
      }
      let prompts = await this.getPrompts();
      console.log('StorageManager: Loaded prompts:', prompts.length);
      
      // 如果沒有 prompts 且有默認值，則使用默認值
      if ((!prompts || prompts.length === 0) && this.defaultPrompts && this.defaultPrompts.length > 0) {
        console.log('StorageManager: No prompts found in storage, using defaults...');
        await this.setPrompts(this.defaultPrompts);
        prompts = this.defaultPrompts;
        console.log('StorageManager: Default prompts set');
      }
      return prompts;
    },

    // 獲取所有prompts
    getPrompts: async function() {
      try {
        // 優先嘗試使用瀏覽器擴展API（如果可用）
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          return new Promise((resolve) => {
            chrome.storage.local.get([this.storageKey], (result) => {
              const prompts = result[this.storageKey] || this.getFromLocalStorage();
              resolve(prompts);
            });
          });
        } else {
          // 回退到localStorage
          return this.getFromLocalStorage();
        }
      } catch (error) {
        console.warn('Storage access failed, using localStorage:', error);
        return this.getFromLocalStorage();
      }
    },

    // 保存prompts
    setPrompts: async function(prompts) {
      try {
        // 優先嘗試使用瀏覽器擴展API（如果可用）
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          return new Promise((resolve) => {
            chrome.storage.local.set({ [this.storageKey]: prompts }, () => {
              // 同時保存到localStorage作為備份
              this.saveToLocalStorage(prompts);
              resolve();
            });
          });
        } else {
          // 使用localStorage
          this.saveToLocalStorage(prompts);
          return Promise.resolve();
        }
      } catch (error) {
        console.warn('Chrome storage failed, using localStorage:', error);
        this.saveToLocalStorage(prompts);
        return Promise.resolve();
      }
    },

    // 從localStorage獲取數據
    getFromLocalStorage: function() {
      try {
        // 檢查localStorage是否可用
        if (typeof localStorage === 'undefined') {
          console.log('localStorage not available, returning default prompts');
          return this.defaultPrompts;
        }
        
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        } else {
          // 如果沒有數據，返回默認prompts
          this.saveToLocalStorage(this.defaultPrompts);
          return this.defaultPrompts;
        }
      } catch (error) {
        console.error('localStorage read error:', error);
        return this.defaultPrompts;
      }
    },

    // 保存到localStorage
    saveToLocalStorage: function(prompts) {
      try {
        // 檢查localStorage是否可用
        if (typeof localStorage === 'undefined') {
          console.log('localStorage not available, skipping backup');
          return;
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(prompts));
      } catch (error) {
        console.error('localStorage write error:', error);
      }
    },

    // 新增一個prompt
    addPrompt: async function(title, content, category) {
      const prompts = await this.getPrompts();
      const newPrompt = {
        id: Date.now(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      prompts.push(newPrompt);
      await this.setPrompts(prompts);
      return newPrompt;
    },

    // 添加存儲變化監聽器
    addChangeListener: function(callback) {
      // 在Service Worker環境中，只能監聽chrome.storage變化
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes) => {
          if (changes[this.storageKey]) {
            callback(changes[this.storageKey].newValue || []);
          }
        });
      } else if (typeof window !== 'undefined') {
        // 在瀏覽器環境中監聽localStorage變化
        window.addEventListener('storage', (e) => {
          if (e.key === this.storageKey) {
            callback(JSON.parse(e.newValue || '[]'));
          }
        });
      } else {
        console.log('StorageManager: Change listener not available in this environment');
      }
    },

    // 導出prompts為JSON
    exportToJson: function(prompts) {
      const dataStr = JSON.stringify(prompts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompts-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    },

    // 從JSON文件導入prompts
    importFromJson: function(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedPrompts = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedPrompts)) {
              throw new Error('Invalid format: expected array');
            }

            // 驗證prompt格式
            const validPrompts = importedPrompts.filter(prompt => 
              prompt && 
              typeof prompt.title === 'string' && 
              typeof prompt.content === 'string'
            );

            resolve(validPrompts);
          } catch (error) {
            reject(new Error('文件格式無效：' + error.message));
          }
        };
        reader.onerror = () => reject(new Error('文件讀取失敗'));
        reader.readAsText(file);
      });
    }
  };

  return storageManager;
}

// 在不同環境中創建全局實例
if (typeof self !== 'undefined') {
  // Service Worker 環境
  self.createStorageManager = createStorageManager;
  if (!self.storageManager) {
    self.storageManager = createStorageManager();
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.createStorageManager = createStorageManager;
  if (!globalThis.storageManager) {
    globalThis.storageManager = createStorageManager();
  }
}

if (typeof window !== 'undefined') {
  // 瀏覽器環境
  window.createStorageManager = createStorageManager;
  if (!window.storageManager) {
    window.storageManager = createStorageManager();
  }
}
