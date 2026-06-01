// 杂项工具：代码块语言角标 / 复制按钮
// 依赖外部全局：ClipboardJS

export function langCode() {
  document.querySelectorAll(".highlight pre code").forEach((block) => {
    const lang = block.getAttribute("data-lang") || "code";
    const corner = document.createElement("span");
    corner.textContent = lang;
    corner.style = `
    position: absolute;
    bottom: 8px; right: 32px;
    font-size: 12px;
    color: #89b4fa;
    font-family: monospace;
    pointer-events: none;
    z-index: 1;
  `;
    block.parentElement.style.position = "relative";
    block.parentElement.appendChild(corner);
  });
}

export function initClipboard() {
  const highlightDiv = document.querySelector("div.highlight");
  if (highlightDiv) {
    (() => {
      document.querySelectorAll("pre code").forEach((code) => {
        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.dataset.clipboardText = code.textContent.trim();
        btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        code.parentNode.style.position = "relative";
        code.parentNode.appendChild(btn);
      });

      new ClipboardJS(".copy-btn").on("success", (e) => {
        e.trigger.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(
          () => (e.trigger.innerHTML = '<i class="fa-regular fa-copy"></i>'),
          1500,
        );
      });
    })();
  }
}
