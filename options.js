// 設置頁面腳本
document.addEventListener('DOMContentLoaded', async () => {
  // 確保存儲管理器已初始化
  if (typeof storageManager !== 'undefined') {
    await storageManager.initialize();
  }
  
  // 獲取DOM元素
  const promptForm = document.getElementById('promptForm');
  const promptTitle = document.getElementById('promptTitle');
  const promptCategory = document.getElementById('promptCategory');
  const promptContent = document.getElementById('promptContent');
  const promptList = document.getElementById('promptList');
  const searchPrompts = document.getElementById('searchPrompts');
  const filterCategory = document.getElementById('filterCategory');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formTitle = document.getElementById('formTitle');
  const alertContainer = document.getElementById('alertContainer');
  const categoryList = document.getElementById('categoryList');
  const totalPrompts = document.getElementById('totalPrompts');
  const totalCategories = document.getElementById('totalCategories');
  
  let allPrompts = [];
  let editingPromptId = null;
  
  // 載入prompts
  async function loadPrompts() {
    try {
      allPrompts = await storageManager.getPrompts();
      renderPrompts();
      updateStats();
      updateCategoryFilter();
      updateCategoryDatalist();
    } catch (error) {
      console.error('Failed to load prompts:', error);
      showAlert('載入prompts失敗', 'danger');
    }
  }
  
  // 更新統計信息
  function updateStats() {
    totalPrompts.textContent = allPrompts.length;
    const categories = [...new Set(allPrompts.map(p => p.category).filter(c => c))];
    totalCategories.textContent = categories.length;
  }
  
  // 更新分類篩選器
  function updateCategoryFilter() {
    const categories = [...new Set(allPrompts.map(p => p.category).filter(c => c))];
    filterCategory.innerHTML = '<option value="">所有分類</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterCategory.appendChild(option);
    });
  }
  
  // 更新分類datalist
  function updateCategoryDatalist() {
    const categories = [...new Set(allPrompts.map(p => p.category).filter(c => c))];
    categoryList.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      categoryList.appendChild(option);
    });
  }
  
  // 渲染prompts
  function renderPrompts() {
    const searchTerm = searchPrompts.value.toLowerCase();
    const selectedCategory = filterCategory.value;
    
    let filteredPrompts = allPrompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm) || 
                           prompt.content.toLowerCase().includes(searchTerm);
      const matchesCategory = !selectedCategory || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    if (filteredPrompts.length === 0) {
      promptList.innerHTML = '<div style="text-align: center; color: #6c757d; padding: 40px;">沒有找到匹配的prompt</div>';
      return;
    }
    
    promptList.innerHTML = '';
    
    filteredPrompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      if (editingPromptId === prompt.id) {
        promptElement.classList.add('editing');
      }
      
      promptElement.innerHTML = `
        <div class="prompt-header">
          <div class="prompt-title">${escapeHtml(prompt.title)}</div>
          ${prompt.category ? `<div class="prompt-category">${escapeHtml(prompt.category)}</div>` : ''}
        </div>
        <div class="prompt-content">${escapeHtml(prompt.content)}</div>
        <div class="prompt-actions">
          <button class="btn btn-primary btn-small" onclick="editPrompt(${prompt.id})">編輯</button>
          <button class="btn btn-danger btn-small" onclick="deletePrompt(${prompt.id})">刪除</button>
          <button class="btn btn-secondary btn-small" onclick="duplicatePrompt(${prompt.id})">複製</button>
        </div>
      `;
      
      promptList.appendChild(promptElement);
    });
  }
    // 保存prompt
  async function savePrompt(e) {
    e.preventDefault();
    
    const title = promptTitle.value.trim();
    const category = promptCategory.value.trim();
    const content = promptContent.value.trim();
    
    if (!title || !content) {
      showAlert('請填寫標題和內容', 'danger');
      return;
    }
    
    const promptData = {
      id: editingPromptId || Date.now(),
      title,
      category,
      content,
      createdAt: editingPromptId ? allPrompts.find(p => p.id === editingPromptId).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editingPromptId) {
      // 編輯現有prompt
      const index = allPrompts.findIndex(p => p.id === editingPromptId);
      allPrompts[index] = promptData;
      showAlert('Prompt更新成功！', 'success');
    } else {
      // 添加新prompt
      allPrompts.unshift(promptData);
      showAlert('Prompt保存成功！', 'success');
    }
    
    // 保存到存儲
    try {
      await storageManager.setPrompts(allPrompts);
      resetForm();
      renderPrompts();
      updateStats();
      updateCategoryFilter();
      updateCategoryDatalist();
    } catch (error) {
      showAlert('保存失敗：' + error.message, 'danger');
    }
  }
  
  // 重置表單
  function resetForm() {
    promptForm.reset();
    editingPromptId = null;
    formTitle.textContent = '添加新的Prompt';
    saveBtn.textContent = '保存Prompt';
    cancelBtn.style.display = 'none';
  }
  
  // 編輯prompt
  window.editPrompt = function(id) {
    const prompt = allPrompts.find(p => p.id === id);
    if (!prompt) return;
    
    promptTitle.value = prompt.title;
    promptCategory.value = prompt.category || '';
    promptContent.value = prompt.content;
    
    editingPromptId = id;
    formTitle.textContent = '編輯Prompt';
    saveBtn.textContent = '更新Prompt';
    cancelBtn.style.display = 'inline-block';
    
    // 滾動到表單
    document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
    
    renderPrompts();
  };
    // 刪除prompt
  window.deletePrompt = async function(id) {
    if (!confirm('確定要刪除這個prompt嗎？')) return;
    
    allPrompts = allPrompts.filter(p => p.id !== id);
    
    // 如果正在編輯被刪除的prompt，重置表單
    if (editingPromptId === id) {
      resetForm();
    }
    
    try {
      await storageManager.setPrompts(allPrompts);
      renderPrompts();
      updateStats();
      updateCategoryFilter();
      updateCategoryDatalist();
      showAlert('Prompt已刪除', 'success');
    } catch (error) {
      showAlert('刪除失敗：' + error.message, 'danger');
    }
  };
    // 複製prompt
  window.duplicatePrompt = async function(id) {
    const prompt = allPrompts.find(p => p.id === id);
    if (!prompt) return;
    
    const newPrompt = {
      ...prompt,
      id: Date.now(),
      title: prompt.title + ' (副本)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    allPrompts.unshift(newPrompt);
    
    try {
      await storageManager.setPrompts(allPrompts);
      renderPrompts();
      updateStats();
      showAlert('Prompt已複製', 'success');
    } catch (error) {
      showAlert('複製失敗：' + error.message, 'danger');
    }
  };
  
  // 顯示提示信息
  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // 3秒後自動消失
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }
  
  // HTML轉義
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 事件監聽器
  promptForm.addEventListener('submit', savePrompt);
  
  cancelBtn.addEventListener('click', resetForm);
  
  searchPrompts.addEventListener('input', renderPrompts);
  filterCategory.addEventListener('change', renderPrompts);
  
  // 導入/導出功能
  const importExportHTML = `
    <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 8px;">
      <h3>導入/導出Prompts</h3>
      <div style="margin-bottom: 15px;">
        <button class="btn btn-secondary" id="exportBtn">導出Prompts</button>
        <input type="file" id="importFile" accept=".json" style="display: none;">
        <button class="btn btn-secondary" id="importBtn">導入Prompts</button>
      </div>
      <p style="font-size: 14px; color: #6c757d;">
        導出：將您的prompts保存為JSON文件<br>
        導入：從JSON文件載入prompts（將與現有prompts合併）
      </p>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', importExportHTML);
    // 導出功能
  document.getElementById('exportBtn').addEventListener('click', () => {
    storageManager.exportToJson(allPrompts);
    showAlert('Prompts已導出', 'success');
  });
  
  // 導入功能
  const importFile = document.getElementById('importFile');
  document.getElementById('importBtn').addEventListener('click', () => {
    importFile.click();
  });
    importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const importedPrompts = await storageManager.importFromJson(file);
      
      // 合併prompts，避免ID衝突
      const maxId = Math.max(...allPrompts.map(p => p.id), 0);
      const newPrompts = importedPrompts.map((prompt, index) => ({
        ...prompt,
        id: maxId + index + 1,
        createdAt: prompt.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      allPrompts = [...allPrompts, ...newPrompts];
      
      await storageManager.setPrompts(allPrompts);
      renderPrompts();
      updateStats();
      updateCategoryFilter();
      updateCategoryDatalist();
      showAlert(`成功導入 ${newPrompts.length} 個prompts`, 'success');
      
    } catch (error) {
      showAlert('導入失敗：' + error.message, 'danger');
    }
    
    importFile.value = '';
  });
  
  // 初始載入
  loadPrompts();
});
