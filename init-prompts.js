// 默認的prompts
const defaultPrompts = [
  {
    id: 1,
    title: "摘要文章內容",
    content: "摘要目前頁面的內容",
    category: "通用",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z"
  },
  {
    id: 2,
    title: "翻譯成繁體中文",
    content: "請幫我將以下內容翻譯成繁體中文：\n\n[請在此處貼上要翻譯的內容]",
    category: "翻譯",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z"
  },
  {
    id: 3,
    title: "翻譯成英文",
    content: "請幫我將以下內容翻譯成英文：\n\n[請在此處貼上要翻譯的內容]",
    category: "翻譯",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z"
  },
  {
    id: 4,
    title: "解釋概念",
    content: "請用簡單易懂的方式解釋以下概念：",
    category: "學習",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z"
  },
  {
    id: 5,
    title: "程式碼審查請求",
    content: "請幫我審查以下程式碼，並提供改進建議：\n\n[請在此處貼上程式碼]",
    category: "編程",
    createdAt: "2025-05-24T00:00:00.000Z",
    updatedAt: "2025-05-24T00:00:00.000Z"
  }
];

// 將 defaultPrompts 暴露到全局作用域
if (typeof globalThis !== 'undefined') {
  globalThis.defaultPromptsFromInit = defaultPrompts;
} else if (typeof window !== 'undefined') {
  window.defaultPromptsFromInit = defaultPrompts;
} else if (typeof self !== 'undefined') {
  self.defaultPromptsFromInit = defaultPrompts;
}

console.log('Default prompts defined at globalThis.defaultPromptsFromInit');
