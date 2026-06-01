// AI 感想生成功能
// 依赖外部全局：marked（可选）、localStorage、fetch
// 仅 initAIReview 对外暴露，其余 buildPrompt/formatReview/escapeHtml/cacheReview/getCachedReview
// 为模块内私有 helper（无 export，esbuild tree-shaking 自动处理）

/**
 * 初始化 AI 感想功能
 */
export function initAIReview() {
  // 检查是否在文章页面
  const reviewSection = document.getElementById("ai-review");
  if (!reviewSection) {
    return;
  }

  const generateBtn = document.getElementById("generate-review");
  const regenerateBtn = document.getElementById("regenerate-review");
  const reviewContent = document.getElementById("ai-review-content");

  // 获取文章信息
  const articleTitle =
    document.querySelector("article h1")?.textContent.trim() || "未知作品";
  const articleContent =
    document
      .querySelector(".content[data-pagefind-body]")
      ?.textContent.trim() || "";

  // 隐藏生成按钮，显示重新生成按钮
  if (generateBtn) {
    generateBtn.style.display = "none";
  }
  if (regenerateBtn) {
    regenerateBtn.style.display = "inline-flex";
  }

  // 重新生成按钮点击事件
  if (regenerateBtn) {
    regenerateBtn.addEventListener("click", () => {
      generateReview(articleTitle, articleContent, reviewContent);
    });
  }

  // 检查是否有缓存的感想
  const cachedReview = getCachedReview(articleTitle);
  if (cachedReview) {
    // 有缓存，直接显示
    reviewContent.innerHTML = cachedReview;
  } else {
    // 没有缓存，自动生成
    generateReview(articleTitle, articleContent, reviewContent);
  }
}

/**
 * 生成 AI 感想
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @param {HTMLElement} container - 显示容器
 */
async function generateReview(title, content, container) {
  // 显示加载状态
  container.innerHTML = `
    <div class="ai-review-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Asuna 正在思考中...</p>
    </div>
  `;

  try {
    // 构造 prompt
    const prompt = buildPrompt(title, content);

    // 调用 AI API
    const review = await callAIAPI(prompt, container);

    if (review) {
      // 显示生成的感想
      container.innerHTML = `
        <div class="ai-review-text">
          ${formatReview(review)}
        </div>
      `;

      // 缓存感想
      cacheReview(title, container.innerHTML);
    }
  } catch (error) {
    console.error("生成感想失败:", error);
    container.innerHTML = `
      <div class="ai-review-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>生成感想时出错了，请稍后重试~</p>
        <small>${error.message}</small>
      </div>
    `;
  }
}

/**
 * 构建 prompt
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容
 * @returns {string} prompt
 */
function buildPrompt(title, content) {
  // 提取文章摘要（限制长度）
  const summary = content.substring(0, 800);

  return `# 角色设定
你是结城明日奈（Asuna），来自《刀剑神域》的温柔坚强的女剑士。你同时也是一位热爱 Galgame 的资深玩家，喜欢在游戏中寻找感动人心的故事。

# 任务
为《${title}》写一段游玩感想。

# 作品简介
${summary}

# 输出要求
- 用"我"作为第一人称，以 Asuna 温柔亲切的语气书写
- 分享对剧情、角色、氛围的真实感受
- 可以提及喜欢或不喜欢的具体元素
- 适当联想到 SAO 中的经历来表达共鸣
- 可以使用 Emoji 辅助表达
- 直接输出纯文本，不要使用 Markdown

# 开始`;
}

/**
 * 调用 AI API（OpenAI 兼容格式，流式输出）
 * @param {string} prompt - 提示词
 * @param {HTMLElement} container - 显示容器
 * @returns {Promise<string>} 生成的感想
 */
async function callAIAPI(prompt, container) {
  // One API 配置（硅基流动 Qwen 2.5 32B Instruct）
  const API_URL = "https://ai.searchgal.top/v1/chat/completions";
  const API_KEY = "sk-dlamYMLcndbINqk83b1f26D1A8B047F9A661CaF8448a642f";
  const MODEL = "Qwen/Qwen2.5-32B-Instruct";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 处理 SSE 流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    // 显示流式输出容器
    container.innerHTML = `
      <div class="ai-review-text ai-review-streaming">
        <div class="streaming-text"></div>
        <span class="streaming-cursor">▊</span>
      </div>
    `;

    const streamingText = container.querySelector(".streaming-text");

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码并处理 SSE 数据
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            streamingText.textContent = fullText;

            // 自动滚动到底部
            container.scrollTop = container.scrollHeight;
          }
        } catch (e) {
          console.warn("解析 SSE 数据失败:", e);
        }
      }
    }

    // 移除光标
    const cursor = container.querySelector(".streaming-cursor");
    if (cursor) {
      cursor.remove();
    }

    return fullText;
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("无法连接到 AI 服务，请检查网络连接");
    }
    throw error;
  }
}

/**
 * 格式化感想文本
 * @param {string} text - 原始文本
 * @returns {string} 格式化后的 HTML
 */
function formatReview(text) {
  // 将文本按段落分割
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // 转换为 HTML 段落
  return paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 缓存感想到 localStorage
 * @param {string} title - 文章标题
 * @param {string} content - 感想内容
 */
function cacheReview(title, content) {
  try {
    const cacheKey = `ai-review-${encodeURIComponent(title)}`;
    localStorage.setItem(cacheKey, content);
  } catch (e) {
    console.warn("缓存感想失败:", e);
  }
}

/**
 * 从 localStorage 获取缓存的感想
 * @param {string} title - 文章标题
 * @returns {string|null} 缓存的感想内容
 */
function getCachedReview(title) {
  try {
    const cacheKey = `ai-review-${encodeURIComponent(title)}`;
    return localStorage.getItem(cacheKey);
  } catch (e) {
    console.warn("读取缓存失败:", e);
    return null;
  }
}
