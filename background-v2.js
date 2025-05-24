// Firefox/Manifest V2 兼容的背景腳本
// 檢測瀏覽器環境
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

// 初始化
async function initialize() {
  await storageManager.initialize();
  createContextMenus();
}

// 創建右鍵菜單
async function createContextMenus() {
  try {
    // 清除現有菜單
    browserAPI.contextMenus.removeAll(async () => {
      const prompts = await storageManager.getPrompts();

      // 創建主菜單
      browserAPI.contextMenus.create({
        id: "prompt-manager",
        title: "插入Prompt",
        contexts: ["editable"]
      });

      // 為每個prompt創建子菜單
      prompts.forEach((prompt) => {
        browserAPI.contextMenus.create({
          id: `prompt-${prompt.id}`,
          parentId: "prompt-manager",
          title: prompt.title,
          contexts: ["editable"]
        });
      });

      // 添加分隔線和管理選項
      browserAPI.contextMenus.create({
        id: "separator",
        parentId: "prompt-manager",
        type: "separator",
        contexts: ["editable"]
      });

      browserAPI.contextMenus.create({
        id: "manage-prompts",
        parentId: "prompt-manager",
        title: "管理Prompt...",
        contexts: ["editable"]
      });
    });
  } catch (error) {
    console.error('Error creating context menus:', error);
  }
}

// 處理右鍵菜單點擊
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.toString().startsWith('prompt-')) {
    const promptId = parseInt(info.menuItemId.toString().replace('prompt-', ''));
    
    const prompts = await storageManager.getPrompts();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
      // 向content script發送插入prompt的消息
      if (isFirefox) {
        browser.tabs.sendMessage(tab.id, {
          action: 'insertPrompt',
          content: prompt.content
        });
      } else {
        chrome.tabs.sendMessage(tab.id, {
          action: 'insertPrompt',
          content: prompt.content
        });
      }
    }
  } else if (info.menuItemId === 'manage-prompts') {
    // 打開設置頁面
    if (isFirefox) {
      browser.runtime.openOptionsPage();
    } else {
      chrome.runtime.openOptionsPage();
    }
  }
});

// 處理來自popup的消息
browserAPI.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'insertPrompt') {
    // 獲取當前活動標籤頁
    const tabs = await browserAPI.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
      browserAPI.tabs.sendMessage(tabs[0].id, {
        action: 'insertPrompt',
        content: request.content
      });
    }
  } else if (request.action === 'getPrompts') {
    // 返回prompts數據
    const prompts = await storageManager.getPrompts();
    sendResponse(prompts);
    return true; // 保持消息通道開放
  }
});

// 監聽存儲變化
storageManager.addChangeListener(() => {
  createContextMenus();
});

// 初始化
if (isFirefox) {
  // Firefox 使用 browser API
  initialize();
} else {
  // Chrome 使用 chrome API
  if (chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(initialize);
  } else {
    initialize();
  }
}
