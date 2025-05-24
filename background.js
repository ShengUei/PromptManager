// 背景腳本 - 處理右鍵菜單和存儲管理
console.log('Background script loading...');

// 導入初始化 prompts
try {
  importScripts('init-prompts.js');
  console.log('init-prompts.js imported successfully');
} catch (error) {
  console.error('Failed to import init-prompts.js:', error);
}

// 導入存儲管理器 - 使用try-catch處理可能的錯誤
try {
  importScripts('storage.js');
  console.log('Storage.js imported successfully');
  
  // 立即創建 storageManager 實例
  if (typeof createStorageManager !== 'undefined') {
    self.storageManager = createStorageManager();
    console.log('Background: StorageManager instance created');
  } else {
    console.error('Background: createStorageManager function not available');
  }
} catch (error) {
  console.error('Failed to import storage.js:', error);
}

// 手動設置預設prompts的函數
async function manuallySetDefaultPrompts() {
  // 從 init-prompts.js 取得預設 prompts
  let defaultPrompts = self.defaultPromptsFromInit;
  
  if (!defaultPrompts || !Array.isArray(defaultPrompts) || defaultPrompts.length === 0) {
    console.error('Background: No default prompts available from init-prompts.js');
    return;
  }
  
  // 為每個 prompt 添加時間戳字段（如果沒有的話）
  const currentTime = new Date().toISOString();
  defaultPrompts = defaultPrompts.map(prompt => ({
    ...prompt,
    createdAt: prompt.createdAt || currentTime,
    updatedAt: prompt.updatedAt || currentTime
  }));
  
  console.log('Background: Using default prompts from init-prompts.js:', defaultPrompts.length);
  
  // 使用 setPrompts 方法來設置所有預設prompts
  await self.storageManager.setPrompts(defaultPrompts);
  console.log('Background: Default prompts added successfully');
}

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Background: Extension installed/updated');
  // 初始化存儲
  try {
    // 確保storageManager可用
    if (typeof self.storageManager === 'undefined') {
      console.error('Background: storageManager not available, trying to create manually');
      // 嘗試手動創建
      if (typeof self.createStorageManager !== 'undefined') {
        self.storageManager = self.createStorageManager();
      } else {
        console.error('Background: createStorageManager function not available');
        return;
      }
    }
    await self.storageManager.initialize();
    console.log('Background: Storage initialized');      // 檢查是否需要添加默認prompts
    const existingPrompts = await self.storageManager.getPrompts();
    console.log('Background: Found existing prompts:', existingPrompts.length);
      if (existingPrompts.length === 0) {
      console.log('Background: No prompts found, initializing default prompts');
      await manuallySetDefaultPrompts();
    } else {
      console.log('Background: Using existing prompts from storage');
    }
  } catch (error) {
    console.error('Background: Storage initialization failed:', error);
  }
  
  // 創建右鍵菜單
  try {
    await createContextMenus();
    console.log('Background: Context menus created');
  } catch (error) {
    console.error('Background: Context menu creation failed:', error);
  }
});

// 確保background script在startup時也初始化
chrome.runtime.onStartup.addListener(async () => {
  console.log('Background: Extension startup');
  try {    // 確保存儲管理器存在
    if (typeof self.storageManager === 'undefined') {
      console.log('Background: Creating storageManager on startup');
      if (typeof self.createStorageManager !== 'undefined') {
        self.storageManager = self.createStorageManager();
      }
    }
    await self.storageManager.initialize();
    await createContextMenus();
  } catch (error) {
    console.error('Background: Startup initialization failed:', error);
  }
});

async function createContextMenus() {
  console.log('Background: Creating context menus...');
  
  // 清除現有菜單，並等待其完成
  await new Promise(resolve => chrome.contextMenus.removeAll(resolve));
  console.log('Background: All previous context menus removed.');
  try {
    // 獲取已儲存的prompt來創建菜單
    const prompts = await self.storageManager.getPrompts();
    console.log('Background: Found prompts for menu:', prompts.length);

    // 創建主菜單
    chrome.contextMenus.create({
      id: "prompt-manager",
      title: "插入Prompt",
      contexts: ["editable"]
    });

    // 為每個prompt創建子菜單
    prompts.forEach((prompt) => {
      chrome.contextMenus.create({
        id: `prompt-${prompt.id}`, // 確保 prompt.id 是唯一的
        parentId: "prompt-manager",
        title: prompt.title,
        contexts: ["editable"]
      });
    });

    // 添加分隔線和管理選項
    chrome.contextMenus.create({
      id: "separator",
      parentId: "prompt-manager",
      type: "separator",
      contexts: ["editable"]
    });

    chrome.contextMenus.create({
      id: "manage-prompts",
      parentId: "prompt-manager",
      title: "管理Prompt...",
      contexts: ["editable"]
    });
    
    console.log('Background: Context menus created successfully');
  } catch (error) {
    console.error('Background: Error creating context menus:', error);
    // 即使創建失敗，也記錄下來，避免影響其他功能
    if (error.message.includes("Cannot create item with duplicate id")) {
        console.warn("Background: Attempted to create duplicate context menu item. This might be a race condition during reload.");
    }
  }
}

// 處理右鍵菜單點擊
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.toString().startsWith('prompt-')) {
    const promptId = parseInt(info.menuItemId.toString().replace('prompt-', ''));
      try {
      // 獲取prompt內容並插入
      const prompts = await self.storageManager.getPrompts();
      const prompt = prompts.find(p => p.id === promptId);
      
      if (prompt && tab) { // 確保 tab 物件存在
        // 確保 content script 已注入
        try {
          // 檢查 content script 是否已經注入並準備好
          await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          console.log('Content script already active in tab:', tab.id);
        } catch (e) {
          // 如果 ping 失敗，說明 content script 未注入或未準備好，執行注入
          console.log('Pinging content script failed, attempting to inject. Error:', e);          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id, allFrames: false }, // 通常只注入到頂層框架
              files: ['storage.js', 'content.js']
            });
            console.log('Content script injected into tab:', tab.id);
            // 等待 content script 初始化，並驗證是否成功
            await new Promise(resolve => setTimeout(resolve, 500)); // 增加等待時間
            
            // 驗證注入是否成功
            try {
              await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
              console.log('Content script injection verified successfully');
            } catch (verifyError) {
              console.error('Content script injection verification failed:', verifyError);
              return; // 驗證失敗則不繼續
            }
          } catch (injectionError) {
            console.error('Failed to inject content script into tab:', tab.id, injectionError);
            return; // 注入失敗則不繼續
          }
        }
          // 向content script發送插入prompt的消息
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'insertPrompt',
            content: prompt.content
          });
          
          if (response && response.success) {
            console.log('Message sent to content script successfully, response:', response);
          } else {
            console.warn('Message sent to content script, but no success response:', response, 'Tab ID:', tab.id);
          }
        } catch (sendError) {
          console.error('Failed to send message to content script:', sendError, 'Tab ID:', tab.id);
        }
      }
    } catch (error) {
      console.error('Error handling context menu click:', error);
    }
  } else if (info.menuItemId === 'manage-prompts') {
    // 打開設置頁面
    chrome.runtime.openOptionsPage();
  }
});

// 監聽存儲變化，更新右鍵菜單
try {
  if (typeof self.storageManager !== 'undefined' && self.storageManager.addChangeListener) {
    self.storageManager.addChangeListener(() => {
      createContextMenus();
    });
  } else {
    console.log('Background: Storage change listener not available');
  }
} catch (error) {
  console.error('Background: Failed to set up storage change listener:', error);
}

// 確保storageManager已初始化的輔助函數
const ensureStorageManager = async () => {
  if (typeof self.storageManager === 'undefined') {
    console.log('Background: StorageManager not available, attempting to create...');
    try {
      if (typeof self.createStorageManager !== 'undefined') {
        self.storageManager = self.createStorageManager();
        await self.storageManager.initialize();
        console.log('Background: StorageManager created and initialized successfully');
      } else {
        throw new Error('createStorageManager function not available');
      }
    } catch (error) {
      console.error('Background: Failed to create StorageManager:', error);
      throw error;
    }
  }
};

// 處理來自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: Received message:', request, 'from:', sender);

  if (request.action === 'insertPrompt') {
    // 獲取當前活動標籤頁
    (async () => {
      try {
        await ensureStorageManager();
        
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        if (tabs[0]) {
          console.log('Background: Inserting prompt to tab:', tabs[0].id);
          
          // 先嘗試直接發送消息
          let messageWorked = false;
          try {
            const response = await chrome.tabs.sendMessage(tabs[0].id, {
              action: 'insertPrompt',
              content: request.content
            });
            console.log('Background: Direct message response:', response);
            messageWorked = true;
            sendResponse({success: true, method: 'direct'});
          } catch (error) {
            console.log('Background: Direct message failed, trying script injection:', error);
          }
          
          // 如果直接消息失敗，嘗試注入並重試
          if (!messageWorked) {
            try {
              // 注入 content script
              await chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['storage.js', 'content.js']
              });
              console.log('Background: Content script injected');
              
              // 等待一下讓 script 初始化
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // 重試發送消息
              const response = await chrome.tabs.sendMessage(tabs[0].id, {
                action: 'insertPrompt',
                content: request.content
              });
              console.log('Background: Retry message response:', response);
              sendResponse({success: true, method: 'injected'});
            } catch (retryError) {
              console.error('Background: Retry also failed:', retryError);
              sendResponse({success: false, error: retryError.message});
            }
          }
        } else {
          sendResponse({success: false, error: 'No active tab found'});
        }      } catch (error) {
        console.error('Background: Error handling insertPrompt:', error);
        sendResponse({success: false, error: error.message});
      }
    })();
    return true; // 保持消息通道開放
  } else if (request.action === 'getPrompts') {
    // 返回prompts數據
    (async () => {
      try {
        // 確保storageManager可用
        await ensureStorageManager();
        
        const prompts = await self.storageManager.getPrompts();
        console.log('Background: Sending prompts:', prompts.length);
        sendResponse({success: true, prompts: prompts});
      } catch (error) {
        console.error('Background: Error getting prompts:', error);
        sendResponse({success: false, error: error.message, prompts: []});
      }
    })();
    return true; // 保持消息通道開放
  } else if (request.action === 'testConnection') {
    // 測試連接
    sendResponse({success: true, message: 'Background script is working'});
    return true;
  }
    return false;
});
