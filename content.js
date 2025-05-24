// Content Script - 處理頁面內容插入
console.log('Content script loaded on:', window.location.href);

// 確保只初始化一次
if (!window.promptManagerContentScriptLoaded) {
  window.promptManagerContentScriptLoaded = true;
  
  console.log('Content script: Initializing...');

  // 提前定義核心函數，確保快捷鍵監聽器可以訪問
  async function showPromptSelector() {
    console.log('Content script: showPromptSelector called');
    
    // 如果選擇器已存在，移除它
    const existingSelector = document.getElementById('prompt-selector-overlay');
    if (existingSelector) {
      existingSelector.remove();
      console.log('Content script: Existing selector removed');
      return;
    }

    // 創建覆蓋層
    const overlay = document.createElement('div');
    overlay.id = 'prompt-selector-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // 創建選擇器容器
    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 500px;
      width: 90%;
      max-height: 400px;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    try {
      console.log('Content script: Requesting prompts from background...');
      
      // 通過消息獲取prompts，設置超時處理
      const prompts = await Promise.race([
        new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({action: 'getPrompts'}, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Content script: Error getting prompts:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
              return;
            }
            // 修復：正確處理背景腳本的回應格式
            if (response && response.success) {
              resolve(response.prompts || []);
            } else {
              console.warn('Content script: Invalid response format, using empty array');
              resolve([]);
            }
          });
        }),
        // 5秒超時
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000);
        })
      ]);

      console.log('Content script: Received prompts:', prompts.length);

      if (prompts.length === 0) {
        container.innerHTML = `
          <h3 style="margin: 0 0 15px 0; color: #333;">Prompt Manager</h3>
          <p style="color: #666; margin: 0 0 15px 0;">沒有找到可用的 Prompt。</p>
          <button onclick="this.closest('#prompt-selector-overlay').remove()" 
                  style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            關閉
          </button>
        `;
      } else {
        let html = '<h3 style="margin: 0 0 15px 0; color: #333;">選擇 Prompt</h3>';
        
        prompts.forEach(prompt => {
          html += `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0; cursor: pointer;" 
                 onmouseover="this.style.background='#f5f5f5'" 
                 onmouseout="this.style.background=''" 
                 onclick="insertPromptAndClose('${prompt.content.replace(/'/g, "\\'")}')">
              <strong style="color: #333;">${prompt.title}</strong>
              <br>
              <small style="color: #666;">${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}</small>
            </div>
          `;
        });
        
        container.innerHTML = html;
      }

    } catch (error) {
      console.error('Content script: Error loading prompts:', error);
      container.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #333;">錯誤</h3>
        <p style="color: #d32f2f; margin: 0 0 15px 0;">載入 Prompt 時發生錯誤：${error.message}</p>
        <button onclick="this.closest('#prompt-selector-overlay').remove()" 
                style="background: #007cba; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          關閉
        </button>
      `;
    }

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    console.log('Content script: Prompt selector displayed');

    // 點擊外部關閉
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        console.log('Content script: Selector closed by outside click');
      }
    });

    // ESC鍵關閉
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
        console.log('Content script: Selector closed by ESC key');
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // 插入prompt並關閉選擇器的全局函數
  window.insertPromptAndClose = function(content) {
    console.log('Content script: Inserting prompt and closing selector');
    try {
      insertPromptToActiveElement(content);      const overlay = document.getElementById('prompt-selector-overlay');
      if (overlay) {
        overlay.remove();
      }
    } catch (error) {
      console.error('Content script: Error inserting prompt:', error);
    }
  };

  // 監聽來自background script的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'insertPrompt') {
      try {
        const result = insertPromptToActiveElement(request.content);
        console.log('Content script: Insert result:', result);
        sendResponse({success: true, message: 'Prompt inserted successfully', details: result});
      } catch (error) {
        console.error('Content script: Error inserting prompt:', error);
        sendResponse({success: false, error: error.message});
      }
    } else if (request.action === 'ping') {
      sendResponse({success: true, message: 'Content script is ready'});
    }
    
    return true; // 保持消息通道開放
  });
  
  // 向background script報告準備就緒
  try {
    chrome.runtime.sendMessage({action: 'contentScriptReady'}, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script: Background not responding, this is normal on initial load or if background is not ready.');
      } else {
        console.log('Content script: Connected to background');
      }
    });
  } catch (error) {
    console.log('Content script: Failed to connect to background:', error);
  }
  console.log('Content script: All event listeners set up');

  // 插入prompt到活動元素
  function insertPromptToActiveElement(content) {
    console.log('Content script: Attempting to insert prompt, length:', content.length);
    
    // 首先檢查當前焦點元素
    const activeElement = document.activeElement;
    console.log('Content script: Active element:', activeElement?.tagName, activeElement?.type);
    
    if (activeElement && isEditableElement(activeElement)) {
      console.log('Content script: Using active element');
      insertText(activeElement, content);
      return {method: 'activeElement', element: activeElement.tagName};
    }
    
    // 如果沒有活動的可編輯元素，嘗試尋找常見的對話框
    const commonSelectors = [
      // 通用輸入框
      'textarea',
      'input[type="text"]',
      'input[type="search"]',
      'input:not([type])',
      '[contenteditable="true"]',
      
      // 常見的聊天輸入框
      '.chat-input',
      '.message-input',
      '.input-box',
      '[data-testid*="input"]',
      '[aria-label*="message"]',
      '[placeholder*="message"]',
      '[placeholder*="輸入"]',
      '[placeholder*="input"]',
      
      // 特定網站的選擇器
      '#message',
      '#prompt',
      '#input',
      '#textInput',
      '.composer-input',
      '.public-DraftEditor-content',
      
      // ChatGPT    '[data-testid="textbox"]',
      'div[contenteditable="true"][role="textbox"]',
      
      // Claude
      '.ProseMirror',
      '[data-testid="chat-input"]',
      
      // 其他 AI 網站
      '.chat-textarea',
      '.prompt-textarea'
    ];
    
    console.log('Content script: Searching for input elements...');
    
    for (const selector of commonSelectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Content script: Found ${elements.length} elements for selector: ${selector}`);
      
      for (const element of elements) {
        if (element && isVisible(element) && isEditableElement(element)) {
          console.log('Content script: Using found element:', selector);
          element.focus();
          insertText(element, content);
          return {method: 'selector', selector: selector, element: element.tagName};
        }
      }
    }
    
    // 如果還是找不到，嘗試最後的方法：查找所有可見的可編輯元素
    console.log('Content script: Trying fallback method...');
    const allEditableElements = document.querySelectorAll('textarea, input, [contenteditable="true"]');
    console.log('Content script: Found', allEditableElements.length, 'editable elements total');
    
    for (const element of allEditableElements) {
      if (isVisible(element) && isEditableElement(element)) {
        console.log('Content script: Using fallback element:', element.tagName);
        element.focus();
        insertText(element, content);
        return {method: 'fallback', element: element.tagName};
      }
    }
    
    console.warn('Content script: No suitable input element found for prompt insertion');
    throw new Error('找不到適合的輸入框。請確保焦點在輸入框中或頁面上有可見的輸入框。');
  }

  // 檢查元素是否可編輯
  function isEditableElement(element) {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();
    
    // 檢查 textarea
    if (tagName === 'textarea') {
      return !element.disabled && !element.readOnly;
    }
    
    // 檢查 input
    if (tagName === 'input') {
      const editableTypes = ['text', 'search', 'url', 'email', 'password', ''];
      return editableTypes.includes(type || '') && !element.disabled && !element.readOnly;
    }
    
    // 檢查 contenteditable
    if (element.contentEditable === 'true') {
      return true;
    }
    
    return false;
  }

  // 插入文字到指定元素
  function insertText(element, text) {
    if (!element) return;
    
    // 確保元素有焦點
    element.focus();
    
    try {
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        // 處理textarea和input元素
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const value = element.value || '';
        
        // 插入文字
        const newValue = value.substring(0, start) + text + value.substring(end);
        element.value = newValue;
        
        // 設置新的光標位置
        const newPosition = start + text.length;
        element.setSelectionRange(newPosition, newPosition);
        
        // 觸發事件
        triggerInputEvents(element);
        
      } else if (element.contentEditable === 'true') {
        // 處理contenteditable元素
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // 確保range在目標元素內
          if (element.contains(range.commonAncestorContainer) || element === range.commonAncestorContainer) {
            range.deleteContents();
            
            // 創建文字節點並插入
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            
            // 移動光標到插入文字後面
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // 如果selection不在目標元素內，直接追加到元素末尾
            element.textContent += text;
          }
        } else {
          // 沒有選擇範圍，直接追加到元素末尾
          if (element.textContent) {
            element.textContent += text;
          } else {
            element.textContent = text;
          }
        }
        
        // 觸發事件
        triggerInputEvents(element);
      }
      
      console.log('Text inserted successfully:', text.substring(0, 50) + '...');
      
    } catch (error) {
      console.error('Error inserting text:', error);
      
      // 備用方法：使用 execCommand (較舊的方法)
      try {
        element.focus();
        document.execCommand('insertText', false, text);
      } catch (e) {
        console.error('Fallback method also failed:', e);
      }
    }
  }

  // 觸發輸入事件
  function triggerInputEvents(element) {
    const events = [
      new Event('input', { bubbles: true, cancelable: true }),
      new Event('change', { bubbles: true, cancelable: true }),
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
      new KeyboardEvent('keyup', { bubbles: true, cancelable: true })
    ];
    
    events.forEach(event => {
      try {
        element.dispatchEvent(event);
      } catch (e) {
        console.warn('Failed to dispatch event:', e);
      }
    });
  }

  // 檢查元素是否可見
  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
} else {
  console.log('Content script: Already loaded and initialized. Skipping re-initialization.');
}
