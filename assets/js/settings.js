// 站点功能设置：按 localStorage 开关，整页加载时动态注入装饰性资源。
// 关闭的功能完全不加载其脚本/样式，零网络开销。
// 依赖 media.js 的 mouseFirework / initMediumZoom（脚本 onload 后兜底初始化）。
import { mouseFirework, initMediumZoom } from "./media.js";

// ---- 资源地址（原先静态写在 scripts.html，迁来集中管理）----
const SRC = {
  firework:
    "https://registry.npmmirror.com/mouse-firework/latest/files/dist/index.umd.js",
  live2d:
    "https://registry.npmmirror.com/weblive2d/latest/files/js/autoload.js",
  zoom: "https://registry.npmmirror.com/medium-zoom/latest/files/dist/medium-zoom.min.js",
  aplayerCSS:
    "https://registry.npmmirror.com/aplayer/latest/files/dist/APlayer.min.css",
  aplayerJS:
    "https://registry.npmmirror.com/aplayer/latest/files/dist/APlayer.min.js",
  metingJS:
    "https://registry.npmmirror.com/meting/latest/files/dist/Meting.min.js",
};

// 播放器 <meting-js> 属性（原 scripts.html 写死的网易云歌单，集中于此便于改）
const PLAYER_ATTRS = {
  id: "8464409595",
  server: "netease",
  type: "playlist",
  fixed: "true",
  autoplay: "false",
  order: "random",
  volume: "0.3",
  "list-folded": "false",
  "list-max-height": "36vh",
};

// ---- 功能清单：设置页 UI 与注入逻辑共用同一份，避免 key 漂移 ----
// live:true 表示开关可即时生效（关闭无需刷新）；其余需刷新后生效。
export const FEATURES = [
  { key: "set-player", label: "音乐播放器", icon: "fa-music", desc: "右下角 APlayer 网易云歌单" },
  { key: "set-live2d", label: "Live2D 看板娘", icon: "fa-ghost", desc: "右下角的动态角色" },
  { key: "set-firework", label: "鼠标点击烟花", icon: "fa-wand-magic-sparkles", desc: "点击页面绽放的粒子特效" },
  { key: "set-fps", label: "FPS 帧率显示", icon: "fa-gauge-high", desc: "右下角实时帧率与吐槽", live: true },
  { key: "set-zoom", label: "图片点击放大", icon: "fa-magnifying-glass-plus", desc: "点击文章图片放大查看" },
];

// ---- 开关读写：默认全开（未设置 null 或 "1" 为开，仅显式 "0" 为关）----
export function isOn(key) {
  const v = window.localStorage.getItem(key);
  return v === null || v === "1";
}
export function setOn(key, on) {
  window.localStorage.setItem(key, on ? "1" : "0");
}

// 旧 key fpson -> set-fps 迁移（仅当 set-fps 尚未写过），
// 避免老用户已关掉的 FPS 因换 key 而被重新打开。
export function migrateLegacyFps() {
  if (window.localStorage.getItem("set-fps") !== null) return;
  const old = window.localStorage.getItem("fpson");
  if (old !== null) {
    window.localStorage.setItem("set-fps", old === "0" ? "0" : "1");
  }
}

// ---- 资源注入 ----
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.fetchPriority = "low";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

// 播放器：必须先让 window.APlayer 就绪，再把 <meting-js> 插入 DOM，否则
// Meting 的 connectedCallback 会因 APlayer 未定义而静默失败（无报错，难排查）。
// 动态注入的 <script> 之间不保证执行顺序，故用串行 onload 强制 APlayer→Meting→元素。
function injectPlayer() {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = SRC.aplayerCSS;
  css.fetchPriority = "low";
  document.body.appendChild(css);

  loadScript(SRC.aplayerJS)
    .then(() => loadScript(SRC.metingJS))
    .then(() => {
      const el = document.createElement("meting-js");
      for (const [k, v] of Object.entries(PLAYER_ATTRS)) el.setAttribute(k, v);
      document.body.appendChild(el); // 此刻 connect，APlayer 已就绪 → 升级成功
    })
    .catch((e) => console.error("[settings] 播放器注入失败:", e));
}

function injectLive2D() {
  loadScript(SRC.live2d).catch((e) =>
    console.error("[settings] Live2D 注入失败:", e),
  );
}

function injectFirework() {
  loadScript(SRC.firework)
    .then(() => mouseFirework()) // onload 后兜底绑定（mouseFirework 自带幂等）
    .catch((e) => console.error("[settings] 烟花注入失败:", e));
}

function injectZoom() {
  loadScript(SRC.zoom)
    .then(() => initMediumZoom()) // onload 后兜底初始化（自带 detach 重建）
    .catch((e) => console.error("[settings] 图片放大注入失败:", e));
}

// 整页加载时按开关注入资源。幂等，只跑一次（swup 切页不重跑此函数）。
let _gatesApplied = false;
export function applyFeatureGates() {
  if (_gatesApplied) return;
  _gatesApplied = true;
  migrateLegacyFps();

  if (isOn("set-player")) injectPlayer();
  if (isOn("set-live2d")) injectLive2D();
  if (isOn("set-firework")) injectFirework();
  if (isOn("set-zoom")) injectZoom();
  // FPS 无外部资源，由 main.js 的 rAF 块按 set-fps 处理。
}

// ---- 设置页渲染 ----
function renderRow(f) {
  return `
    <div class="setting-row">
      <div class="setting-meta">
        <i class="fa ${f.icon} setting-icon" aria-hidden="true"></i>
        <span class="setting-text">
          <span class="setting-label">${f.label}</span>
          <span class="setting-desc">${f.desc}</span>
        </span>
      </div>
      <button class="setting-toggle" type="button" role="switch"
              aria-checked="${isOn(f.key)}" aria-label="${f.label}" data-key="${f.key}">
        <span class="setting-toggle-knob" aria-hidden="true"></span>
      </button>
    </div>`;
}

// 即时生效的开关。返回 true 表示已完全应用、无需刷新；false 表示仍需刷新。
function applyLive(key, on) {
  if (key === "set-fps") {
    // 与 main.js 一致，用 <html> 上的 fps-off 类驱动 CSS 隐藏。
    if (!on) {
      document.documentElement.classList.add("fps-off");
      return true; // 关闭即时隐藏
    }
    if (window._fpsRunning) {
      document.documentElement.classList.remove("fps-off");
      return true; // 循环在跑，即时显示
    }
    return false; // 循环未启动（加载时为关），保持隐藏，刷新后才会重启计数
  }
  return false;
}

export function initSetPage() {
  // 仅当前页容器（排除 swup 平行过渡期间短暂共存的离场旧页，与 getActiveComments 同理）
  const list = document.querySelector(
    "main:not(.is-previous-container) #settings-list",
  );
  if (!list) return; // 不在设置页
  if (list._settingsBound) return; // 幂等：swup page:view 会重复调用
  list._settingsBound = true;

  list.innerHTML = FEATURES.map(renderRow).join("");

  const reload = document.getElementById("settings-reload");

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".setting-toggle");
    if (!btn) return;
    const key = btn.dataset.key;
    const next = btn.getAttribute("aria-checked") !== "true";
    btn.setAttribute("aria-checked", String(next));
    setOn(key, next);

    const feat = FEATURES.find((f) => f.key === key);
    const appliedNow = feat && feat.live ? applyLive(key, next) : false;
    if (!appliedNow && reload) reload.classList.add("is-dirty");
  });

  if (reload && !reload._bound) {
    reload._bound = true;
    reload.addEventListener("click", () => window.location.reload());
  }
}
