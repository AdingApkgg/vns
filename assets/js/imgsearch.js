// 以图识别（/img-search）：上传 / 拖拽 / 粘贴图片，或填图片网址 →
// 直连 AnimeTrace 识别角色与出处，并把识别到的「作品名」尽量回链到本站收录的条目。
//
// AnimeTrace 免密钥、CORS 全开，可前端直连（无需后端代理）。
// 图片会直接发送到第三方 api.animetrace.com 进行识别，本站不经手、不存储。

const ANIMETRACE_API = "https://api.animetrace.com/v1/search";

// 实测可用模型（2026-06）：
//   full_game_model_kira  游戏 / Galgame 向，专搜 Gal 角色（默认 —— 本站为 Gal 站，
//                         实测对站内封面回链命中率远高于动画模型）
//   anime_model_lovelive  动画向，旗舰高精度（作品有动画化或图来自动画时更准）
// 其它如 game_model_kira / full_game_model 会返回 code 17729（未知模型）。
const DEFAULT_MODEL = "full_game_model_kira";

// 已知错误码 → 文案；其余兜底为通用提示并带上 code。
const CODE_MSG = {
  17728: "已达到使用上限，AnimeTrace 按 IP 限流，请稍后再试。",
  17729: "该识别模型当前不可用，换一个模型试试。",
};

// 其它以图搜索引擎（找「确切出处 / 画师」用）。url() 用图片网址直搜；home 为本地上传时的手动入口。
const ENGINES = [
  { name: "SauceNAO", home: "https://saucenao.com/", url: (u) => `https://saucenao.com/search.php?url=${encodeURIComponent(u)}` },
  { name: "ascii2d", home: "https://ascii2d.net/", url: (u) => `https://ascii2d.net/search/url/${encodeURIComponent(u)}` },
  { name: "Google", home: "https://lens.google.com/", url: (u) => `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(u)}` },
  { name: "Yandex", home: "https://yandex.com/images/", url: (u) => `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(u)}` },
];

let pasteHandler = null; // document 级粘贴监听：每次 init 先移除旧的再绑新的，避免跨 swup 导航泄漏

// ---- 文本归一化：用于把 AnimeTrace 的作品名匹配到本站标题别名 ----
// NFKC + 小写 + 去空白与常见标点，仅保留字母数字与 CJK。
function norm(s) {
  if (!s) return "";
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]+/g, "")
    .replace(/[~〜～:：・.。,，!！?？'’"“”\-—_/／｜|()（）\[\]【】<>《》「」『』#&+*…]/g, "");
}

function esc(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// 从「中文／日文／罗马音」拼接的标题里取中文名：优先含汉字且不含假名的片段，
// 退而取首个片段。AnimeTrace 只返回日文原名，靠本站标题映射成中文。
function chineseName(title) {
  const parts = String(title || "")
    .split(/[／/｜|]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hasKana = (s) => /[぀-ヿ]/.test(s); // 平假名 + 片假名
  const hasHan = (s) => /[一-鿿]/.test(s);
  return parts.find((p) => hasHan(p) && !hasKana(p)) || parts[0] || String(title || "");
}

// 读取页面内联的站内条目索引（layouts/img-search.html 注入），构建匹配用结构。
function loadIndex() {
  const el = document.getElementById("gal-index");
  if (!el) return [];
  let raw;
  try {
    raw = JSON.parse(el.textContent || "[]");
    // 兜底：若被 html/template 当 JS 字符串转义成了 "[...]"，再解析一层。
    if (typeof raw === "string") raw = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => {
    const aliases = String(e.t || "")
      .split(/[／/｜|]/)
      .map((a) => a.trim())
      .filter(Boolean);
    const keys = [...new Set([norm(e.t), ...aliases.map(norm)].filter((k) => k.length >= 2))];
    return { title: e.t, url: e.u, cover: e.c, keys, zh: chineseName(e.t) };
  });
}

// 把单个作品名匹配到最可能的站内条目（偏精确，宁缺毋滥，避免错误回链）。
function matchWork(work, index) {
  const w = norm(work);
  if (w.length < 3) return null;
  const allowContains = w.length >= 4;
  let best = null;
  for (const item of index) {
    for (const k of item.keys) {
      let score = 0;
      if (k === w) score = 1;
      else if (allowContains && k.length >= 4 && (k.includes(w) || w.includes(k)))
        score = 0.85 * (Math.min(k.length, w.length) / Math.max(k.length, w.length));
      if (score > (best ? best.score : 0)) best = { item, score };
    }
  }
  return best && best.score >= 0.62 ? best : null;
}

async function callAnimeTrace({ file, url, model }) {
  const opts = { method: "POST" };
  if (file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("model", model);
    opts.body = fd;
  } else {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify({ url, model });
  }
  const res = await fetch(ANIMETRACE_API, opts);
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// ---- 渲染 ----
function renderEngines(sourceUrl) {
  if (sourceUrl) {
    const btns = ENGINES.map(
      (e) =>
        `<a class="is-engine" href="${esc(e.url(sourceUrl))}" target="_blank" rel="noopener noreferrer">${esc(
          e.name
        )}</a>`
    ).join("");
    return `<div class="is-engines"><span class="is-engines-label">找确切出处 / 画师：</span>${btns}</div>`;
  }
  // 本地上传无公开网址，无法转交其它引擎，仅给入口由用户手动上传。
  const btns = ENGINES.map(
    (e) =>
      `<a class="is-engine" href="${esc(e.home)}" target="_blank" rel="noopener noreferrer">${esc(e.name)}</a>`
  ).join("");
  return `<div class="is-engines"><span class="is-engines-label">想找确切出处？本地图片需到这些引擎手动上传，或改用图片网址搜索：</span>${btns}</div>`;
}

function render(resultsEl, { data, index, sourceUrl }) {
  const boxes = Array.isArray(data) ? data.filter((b) => b && Array.isArray(b.character) && b.character.length) : [];

  if (!boxes.length) {
    resultsEl.innerHTML =
      `<div class="is-empty"><i class="fa fa-face-frown" aria-hidden="true"></i> 没有识别到角色。` +
      `换个清晰、含人物的画面，或切换模型再试。</div>` +
      renderEngines(sourceUrl);
    return;
  }

  // 把日文作品名经本站条目映射成中文（命中收录的作品才有中文名）。带记忆化。
  const zhCache = new Map();
  const zhOf = (work) => {
    if (zhCache.has(work)) return zhCache.get(work);
    const m = matchWork(work, index);
    const v = m ? m.item.zh : null;
    zhCache.set(work, v);
    return v;
  };
  // 作品名展示：有中文映射且与原文不同则「中文（原文）」，否则原文。
  const workHtml = (work) => {
    const zh = zhOf(work);
    return zh && zh !== work
      ? `${esc(zh)}<span class="is-char-work-ja">（${esc(work)}）</span>`
      : esc(work);
  };

  // 收集每个 box 的 top 候选去匹配本站，按条目去重保留最高分。
  const matched = new Map();
  boxes.forEach((b) => {
    b.character.slice(0, 3).forEach((c) => {
      const m = matchWork(c.work, index);
      if (m) {
        const prev = matched.get(m.item.url);
        if (!prev || m.score > prev.score) matched.set(m.item.url, { ...m, via: c });
      }
    });
  });

  let html = "";

  // 1) 本站收录（最有价值，置顶）
  if (matched.size) {
    const cards = [...matched.values()]
      .sort((a, b) => b.score - a.score)
      .map(
        (m) => `
        <a class="is-hit" href="${esc(m.item.url)}" data-no-swup>
          ${m.item.cover ? `<img class="is-hit-cover" src="${esc(m.item.cover)}" alt="" loading="lazy">` : ""}
          <span class="is-hit-body">
            <span class="is-hit-title">${esc(m.item.zh || m.item.title)}</span>
            <span class="is-hit-meta">命中角色「${esc(m.via.character)}」· ${esc(m.via.work)}</span>
          </span>
          <i class="fa fa-arrow-right is-hit-arrow" aria-hidden="true"></i>
        </a>`
      )
      .join("");
    html += `<section class="is-block"><h3 class="is-block-title"><i class="fa fa-star" aria-hidden="true"></i> 本站可能收录</h3><div class="is-hits">${cards}</div></section>`;
  }

  // 2) AnimeTrace 逐角色识别结果
  const charBlocks = boxes
    .map((b, i) => {
      const top = b.character[0];
      const more = b.character.slice(1, 6);
      const moreHtml = more.length
        ? `<details class="is-more"><summary>其它可能（${more.length}）</summary><ul>${more
            .map((c) => `<li><b>${esc(c.character)}</b><span>${workHtml(c.work)}</span></li>`)
            .join("")}</ul></details>`
        : "";
      return `
        <div class="is-char">
          <div class="is-char-head"><span class="is-char-idx">人物 ${i + 1}</span>${
        b.not_confident ? `<span class="is-char-low">可信度较低</span>` : ""
      }</div>
          <div class="is-char-top"><b class="is-char-name">${esc(top.character)}</b><span class="is-char-work">${workHtml(
        top.work
      )}</span></div>
          ${moreHtml}
        </div>`;
    })
    .join("");
  html += `<section class="is-block"><h3 class="is-block-title"><i class="fa fa-wand-magic-sparkles" aria-hidden="true"></i> 识别结果 <span class="is-by">by AnimeTrace</span></h3><div class="is-chars">${charBlocks}</div></section>`;

  // 3) 外部引擎找出处
  html += renderEngines(sourceUrl);

  resultsEl.innerHTML = html;
}

export function initImgSearch() {
  const root = document.getElementById("imgsearch");
  if (!root) return;

  const drop = root.querySelector("#isDrop");
  const fileInput = root.querySelector("#isFile");
  const preview = root.querySelector("#isPreview");
  const urlInput = root.querySelector("#isUrl");
  const goBtn = root.querySelector("#isGo");
  const statusEl = root.querySelector("#isStatus");
  const resultsEl = root.querySelector("#isResults");
  const modelBtns = [...root.querySelectorAll(".is-model")];

  const index = loadIndex();
  let current = { file: null, url: "" }; // 当前待识别的输入
  let objectUrl = null; // 本地预览用，记得回收
  let busy = false;

  const getModel = () => {
    const on = modelBtns.find((b) => b.classList.contains("is-on"));
    return (on && on.dataset.model) || DEFAULT_MODEL;
  };

  function setStatus(html) {
    if (!html) {
      statusEl.hidden = true;
      statusEl.innerHTML = "";
    } else {
      statusEl.hidden = false;
      statusEl.innerHTML = html;
    }
  }

  function showPreview(src) {
    if (!src) {
      preview.hidden = true;
      preview.removeAttribute("src");
      drop.classList.remove("has-img");
      return;
    }
    preview.src = src;
    preview.hidden = false;
    drop.classList.add("has-img");
  }

  function setFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      setStatus(`<i class="fa fa-triangle-exclamation"></i> 请选择图片文件`);
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    current = { file, url: "" };
    if (urlInput) urlInput.value = "";
    showPreview(objectUrl);
    run();
  }

  function setUrl(url) {
    url = (url || "").trim();
    if (!url) return;
    current = { file: null, url };
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    showPreview(url);
    run();
  }

  async function run() {
    if (busy) return;
    if (!current.file && !current.url) {
      setStatus(`<i class="fa fa-circle-info"></i> 先上传图片或填入图片网址`);
      return;
    }
    busy = true;
    goBtn.disabled = true;
    resultsEl.innerHTML = "";
    setStatus(`<i class="fa fa-spinner fa-spin"></i> 识别中…`);
    try {
      const json = await callAnimeTrace({ ...current, model: getModel() });
      if (json && json.code === 0) {
        setStatus("");
        render(resultsEl, { data: json.data, index, sourceUrl: current.url || "" });
      } else {
        const code = json && json.code;
        setStatus(
          `<i class="fa fa-triangle-exclamation"></i> ${esc(CODE_MSG[code] || `识别失败${code != null ? `（code ${code}）` : ""}，请稍后再试。`)}`
        );
        render(resultsEl, { data: [], index, sourceUrl: current.url || "" });
      }
    } catch (e) {
      const msg =
        e && e.message === "RATE_LIMIT"
          ? `<i class="fa fa-hourglass-half"></i> 请求过于频繁，AnimeTrace 已限流，请稍候再试。`
          : `<i class="fa fa-plug-circle-xmark"></i> 网络请求失败，请检查网络或稍后再试。`;
      setStatus(msg);
    } finally {
      busy = false;
      goBtn.disabled = false;
    }
  }

  // —— 事件绑定 ——
  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", () => fileInput.files[0] && setFile(fileInput.files[0]));

  ["dragenter", "dragover"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("is-dragover");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === "dragleave" && drop.contains(e.relatedTarget)) return;
      drop.classList.remove("is-dragover");
    })
  );
  drop.addEventListener("drop", (e) => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) setFile(f);
  });

  goBtn.addEventListener("click", () => {
    if (urlInput && urlInput.value.trim()) setUrl(urlInput.value);
    else run();
  });
  if (urlInput)
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setUrl(urlInput.value);
      }
    });

  modelBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-on")) return;
      modelBtns.forEach((b) => {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
      if (current.file || current.url) run(); // 换模型后用同一张图重搜
    })
  );

  // 全站粘贴图片：移除上一页实例绑的 handler，再绑当前实例的（闭包持有本页 setFile）。
  if (pasteHandler) document.removeEventListener("paste", pasteHandler);
  pasteHandler = (e) => {
    if (!root.isConnected) return; // 本页已被 swup 替换则忽略
    const items = (e.clipboardData && e.clipboardData.items) || [];
    for (const it of items) {
      if (it.type && it.type.indexOf("image") === 0) {
        const f = it.getAsFile();
        if (f) {
          e.preventDefault();
          setFile(f);
        }
        return;
      }
    }
  };
  document.addEventListener("paste", pasteHandler);
}
