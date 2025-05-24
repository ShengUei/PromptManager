// Popup腳本
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('searchInput');
  const promptList = document.getElementById('promptList');
  const manageBtn = document.getElementById('manageBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  
  let allPrompts = [];
    // 初始化本地 storageManager（如果可用）
  let localStorageManager = null;
  try {
    if (typeof createStorageManager !== 'undefined') {
      localStorageManager = createStorageManager();
      console.log('Popup: Local storageManager created successfully');
      
      // 初始化並檢查是否需要設置預設 prompts
      await localStorageManager.initialize();
      
      // 檢查並設置預設 prompts（如果沒有的話）
      const existingPrompts = await localStorageManager.getPrompts();
      if (existingPrompts.length === 0 && typeof defaultPromptsFromInit !== 'undefined') {
        console.log('Popup: No prompts found, setting default prompts...');
        await localStorageManager.setPrompts(defaultPromptsFromInit);
        console.log('Popup: Default prompts set from init-prompts.js');
      }
    }
  } catch (error) {
    console.log('Popup: Failed to create local storageManager:', error);
  }
    // 載入prompts
  async function loadPrompts() {
    console.log('Popup: Starting to load prompts...');
    console.log('Popup: Available global objects:', {
      chrome: typeof chrome,
      createStorageManager: typeof createStorageManager,
      defaultPromptsFromInit: typeof defaultPromptsFromInit,
      localStorageManager: !!localStorageManager
    });
    try {
      // 先嘗試從 background script 獲取（更可靠）
      try {
        console.log('Popup: Trying to get prompts from background script...');
        allPrompts = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Background script timeout'));
          }, 3000);
          
          chrome.runtime.sendMessage({action: 'getPrompts'}, (response) => {
            clearTimeout(timeout);
            console.log('Popup: Background response:', response);
            
            if (chrome.runtime.lastError) {
              console.error('Popup: Runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (response && response.success && response.prompts) {
              console.log('Popup: Successfully received prompts from background:', response.prompts.length);
              resolve(response.prompts);
            } else {
              console.log('Popup: No prompts from background, trying local storage...');
              resolve(null); // 標示需要嘗試本地存儲
            }
          });
        });
      } catch (backgroundError) {
        console.log('Popup: Background script failed, trying local storage:', backgroundError.message);
        allPrompts = null;
      }
        // 如果 background script 失敗，嘗試本地 storageManager
      if (allPrompts === null && localStorageManager) {
        console.log('Popup: Using local storageManager as fallback');
        await localStorageManager.initialize();
        allPrompts = await localStorageManager.getPrompts();
        console.log('Popup: Loaded prompts from local storage:', allPrompts.length);
      }
      
      // 如果仍然沒有 prompts，使用空陣列
      if (allPrompts === null) {
        console.log('Popup: No prompts available from any source');
        allPrompts = [];
      }
      
      console.log('Popup: Final prompts count:', allPrompts.length);
      renderPrompts(allPrompts);
    } catch (error) {
      console.error('Popup: Failed to load prompts:', error);
      allPrompts = [];
      renderPrompts([]);
      
      // 顯示錯誤狀態
      promptList.innerHTML = `
        <div class="empty-state">
          <p style="color: #ff6b6b;">載入失敗</p>
          <p>請點擊刷新重試或檢查控制台</p>
        </div>
      `;
    }
  }
    // 渲染prompts
  function renderPrompts(prompts) {
    console.log('Popup: Rendering prompts:', prompts.length);
    
    if (prompts.length === 0) {
      promptList.innerHTML = `
        <div class="empty-state">
          <p>沒有找到任何 prompt</p>
          <p>點擊"刷新"重新載入或"管理Prompt"開始添加</p>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            如果問題持續存在，請檢查瀏覽器控制台
          </p>
        </div>
      `;
      return;
    }
    
    promptList.innerHTML = '';
    
    prompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      
      const preview = prompt.content.length > 60 
        ? prompt.content.substring(0, 60) + '...' 
        : prompt.content;
        promptElement.innerHTML = `
        <div class="prompt-title">${escapeHtml(prompt.title)}</div>
        <div class="prompt-preview">${escapeHtml(preview)}</div>
        ${prompt.category ? `<span class="prompt-category">${escapeHtml(prompt.category)}</span>` : ''}
      `;
      
      promptElement.addEventListener('click', async () => {
        console.log('Popup: Prompt clicked:', prompt.title);
        
        // 顯示載入狀態
        promptElement.style.opacity = '0.5';
        promptElement.style.pointerEvents = 'none';
        
        try {
          // 複製到剪貼簿
          await navigator.clipboard.writeText(prompt.content);
          console.log('Popup: Prompt copied to clipboard successfully');
          
          // 顯示成功提示
          const originalHTML = promptElement.innerHTML;
          promptElement.innerHTML = `
            <div class="prompt-title" style="color: #4CAF50;">✓ 已複製到剪貼簿</div>
            <div class="prompt-preview">${escapeHtml(preview)}</div>
            ${prompt.category ? `<span class="prompt-category">${escapeHtml(prompt.category)}</span>` : ''}
          `;
          
          // 2秒後關閉彈窗
          setTimeout(() => {
            window.close();
          }, 1500);
          
        } catch (error) {
          console.error('Popup: Failed to copy to clipboard:', error);
          
          // 恢復元素狀態
          promptElement.style.opacity = '1';
          promptElement.style.pointerEvents = 'auto';
          
          // 顯示錯誤提示
          const originalHTML = promptElement.innerHTML;
          promptElement.innerHTML = `
            <div class="prompt-title" style="color: #ff6b6b;">✗ 複製失敗</div>
            <div class="prompt-preview">${escapeHtml(preview)}</div>
            ${prompt.category ? `<span class="prompt-category">${escapeHtml(prompt.category)}</span>` : ''}
          `;
          
          // 3秒後恢復原來的內容
          setTimeout(() => {
            promptElement.innerHTML = originalHTML;
            promptElement.style.opacity = '1';
            promptElement.style.pointerEvents = 'auto';
          }, 3000);
        }
      });
      
      promptList.appendChild(promptElement);
    });
  }
  
  // 搜索功能
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPrompts = allPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) || 
      prompt.content.toLowerCase().includes(searchTerm) ||
      (prompt.category && prompt.category.toLowerCase().includes(searchTerm))
    );
    renderPrompts(filteredPrompts);
  });
  
  // 管理按鈕
  manageBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
    // 刷新按鈕
  refreshBtn.addEventListener('click', () => {
    console.log('Popup: Refresh button clicked');
    loadPrompts();
    searchInput.value = '';
  });
  
  // HTML轉義函數
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
    // 初始載入
  loadPrompts();
    // 監聽存儲變化（只有當 localStorageManager 可用時）
  if (localStorageManager && localStorageManager.addChangeListener) {
    localStorageManager.addChangeListener((newPrompts) => {
      console.log('Popup: Storage changed, updating prompts:', newPrompts.length);
      allPrompts = newPrompts;
      renderPrompts(allPrompts);
    });
  }
});
