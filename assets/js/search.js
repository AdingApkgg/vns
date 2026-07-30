// 站点搜索与导航助手：search / 随机跳转 / 快捷键 / 18+ 验证
// 依赖外部全局：PagefindComponents（Pagefind Component UI）/ swup / Swal / window.localStorage

export function initSearch() {
  // Pagefind Component UI 的 <pagefind-*> 组件会自动连接并工作，无需手动实例化。
  // 这里只负责 ?q=keyword 深链：进入 /search/?q=xxx 时自动填入并执行搜索。
  if (!document.querySelector("pagefind-input")) return;

  var query = new URLSearchParams(window.location.search).get("q");
  if (!query) return;

  // <head> 的 module 脚本会挂载 window.PagefindComponents：首次硬加载时它（defer）
  // 在 DOMContentLoaded 前已执行，swup 软导航时也已存在。保险起见轮询等待就绪后
  // 再触发；triggerSearch 会自动把查询词同步到输入框的显示值。
  var attempts = 0;
  (function run() {
    var pf = window.PagefindComponents;
    if (pf && pf.getInstanceManager) {
      pf.getInstanceManager().getInstance("default").triggerSearch(query);
      return;
    }
    if (attempts++ < 50) setTimeout(run, 100);
  })();
}

export function initGalPopup() {
  const ageVerificationTime = localStorage.getItem("ageVerificationTime");
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const now = new Date().getTime();
  if (!ageVerificationTime || now - parseInt(ageVerificationTime) > oneWeek) {
    document.getElementById("caution").style.display = "block";
    const cautionYes = document.querySelector("#caution .btn-yes");
    const cautionNo = document.querySelector("#caution .btn-no");
    cautionYes.addEventListener("click", function () {
      localStorage.setItem("ageVerificationTime", now.toString());
      document.getElementById("caution").style.display = "none";
      setTimeout(function () {
        const sukiAudio = new Audio("/media/suki.mp3");
        sukiAudio.play();
      }, 500);
    });
    cautionNo.addEventListener("click", function () {
      window.location.href =
        "//player.bilibili.com/player.html?bvid=BV1GJ411x7h7";
    });
  } else {
    document.getElementById("caution").style.display = "none";
  }
}

export function rv() {
  const triggers = document.querySelectorAll(
    "#item-random, [data-random-link]"
  );
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      fetch("/p/index.xml")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch index.xml");
          return response.text();
        })
        .then((xmlText) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          const links = xmlDoc.getElementsByTagName("link");
          const posts = Array.from(links)
            .map((link) => link.textContent)
            .filter((url) => url !== "{{ .Site.BaseURL }}");

          if (!posts || posts.length === 0) {
            Swal.fire({
              icon: "info",
              title: "没有可用的随机页面",
              text: "稍后再试试吧～",
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 3000,
            });
            return;
          }
          const randomUrl = posts[Math.floor(Math.random() * posts.length)];
          swup.navigate(randomUrl);
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "随机页面加载失败",
            text: "网络好像不太给力，稍后再试～",
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
        });
    });
  });
}



export function shortcutKey() {
  const routes = {
    h: "/",
    d: "/docs/",
    t: "/tags/",
    p: "/platforms/",
    c: "/comments/",
    l: "/links/",
    a: "/about/",
    r: "/rank/",
    "/": "/search/",
  };

  const pressed = new Set();
  let triggered = false;

  document.addEventListener("keydown", (e) => {
    const el = e.target;

    if (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    pressed.add(key);

    if (triggered) return;

    if (pressed.has("v") && key !== "v" && routes[key]) {
      e.preventDefault();

      triggered = true;

      const target = routes[key];
      if (window.location.pathname !== target) {
        swup.navigate(target);
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    pressed.delete(e.key.toLowerCase());

    triggered = false;
  });
}


// ── 顶栏内联即时搜索 ──
// Pagefind 的 JS API 按需懒加载：首次聚焦/输入搜索框时才注入 <script type="module">
// import 一次（用 textContent 注入，避开 esbuild 对运行时产物 /pagefind/pagefind.js 的
// 静态解析），结果挂到 window.__pagefind。回车（无选中项时）跳 /search/?q= 交给完整
// 搜索页。dev 环境没有 /pagefind 索引时 import 失败 → 优雅降级（仅回车跳转）。
let _pfPromise = null;
function loadPagefind() {
  if (_pfPromise) return _pfPromise;
  _pfPromise = new Promise((resolve) => {
    if (window.__pagefind) return resolve(window.__pagefind);
    const s = document.createElement("script");
    s.type = "module";
    s.textContent =
      'import("/pagefind/pagefind.js").then(p=>{window.__pagefind=p;' +
      'document.dispatchEvent(new Event("pagefind:ready"))})' +
      '.catch(()=>document.dispatchEvent(new Event("pagefind:fail")))';
    document.addEventListener("pagefind:ready", () => resolve(window.__pagefind), { once: true });
    document.addEventListener("pagefind:fail", () => resolve(null), { once: true });
    document.head.appendChild(s);
  });
  return _pfPromise;
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

// 移动端顶栏滚动行为：下滚隐藏、上滚显示（Butterfly 同款）。
// scroll 监听绑在 window（持久，只绑一次）；回调内动态取当前 header（swup 会重渲 header）。
// 用时间戳节流而非 requestAnimationFrame —— 后者在后台标签会被浏览器节流甚至暂停。
export function initHeaderScroll() {
  const apply = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const y = window.scrollY;
    // 下滚隐藏、上滚显示
    if (y > window._navLastY && y > 80) header.classList.add("nav-hidden");
    else if (y < window._navLastY) header.classList.remove("nav-hidden");
    // （旧的"首页滚到顶时顶栏透明覆盖"已移除：那是桌面顶栏悬在首页大图上时的效果，
    //   如今顶栏只在移动端存在且内容从其下方排布，透明只会显得"没颜色"。）
    window._navLastY = y;
  };
  // scroll 监听只绑一次（window 持久）；apply 每次 page:view 也跑——切到首页立即透明、切走恢复
  if (!window._headerScrollBound) {
    window._headerScrollBound = true;
    window._navLastY = window.scrollY;
    let lastRun = 0;
    window.addEventListener(
      "scroll",
      () => {
        const now = Date.now();
        if (now - lastRun < 100) return; // 约 10fps
        lastRun = now;
        apply();
      },
      { passive: true },
    );
  }
  apply();
}

// 页面二维码：点击图标按钮才懒加载二维码并放大成居中模态；点遮罩 / Esc 关闭。
export function initPageQR() {
  const wrap = document.querySelector(".page-qr");
  if (!wrap || wrap._qrBound) return;
  wrap._qrBound = true;
  const btn = wrap.querySelector(".page-qr-btn");
  const modal = wrap.querySelector(".page-qr-modal");
  const img = modal && modal.querySelector(".page-qr-img");
  if (!btn || !modal) return;
  btn.addEventListener("click", () => {
    if (img && img.dataset.src && !img.getAttribute("src")) img.src = img.dataset.src; // 点击才加载
    modal.hidden = false;
  });
  modal.addEventListener("click", () => { modal.hidden = true; });
  if (!document._qrEscBound) {
    document._qrEscBound = true;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const m = document.querySelector(".page-qr-modal");
      if (m && !m.hidden) m.hidden = true;
    });
  }
}

// 即时搜索（Pagefind）：桌面竖栏搜索框与移动端顶栏展开的搜索条共用这套绑定，
// 行为完全一致 —— 输入即出结果浮层、方向键/回车、Enter 兜底跳 /search/ 整页。
export function initHeadSearch() {
  // 上一页 portal 到 body 的旧浮层：宿主搜索框已随 swup 重渲销毁（_wrap 断链）→ 清掉
  document.querySelectorAll("body > .hdr-search-panel").forEach((el) => {
    if (!el._wrap || !el._wrap.isConnected) el.remove();
  });

  bindInstantSearch("hdrSearch", "hdrSearchInput", "hdrSearchPanel"); // 桌面竖栏
  bindInstantSearch("mSearch", "mSearchInput", "mSearchPanel"); // 移动搜索条

  // 移动端顶栏放大镜：展开/收起搜索条（不再跳 /search/ 整页，与桌面行为对齐）
  const toggle = document.getElementById("mSearchToggle");
  const bar = document.getElementById("mSearchBar");
  if (toggle && bar && !toggle._msBound) {
    toggle._msBound = true;
    toggle.addEventListener("click", () => {
      bar.hidden = !bar.hidden;
      toggle.setAttribute("aria-expanded", bar.hidden ? "false" : "true");
      if (!bar.hidden) {
        const i = document.getElementById("mSearchInput");
        if (i) i.focus();
      }
    });
  }
}

function bindInstantSearch(wrapId, inputId, panelId) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  const panel = document.getElementById(panelId);
  if (!wrap || !input || !panel) return;
  // swup 软导航会重渲侧栏/顶栏（新元素无标记）；旧元素随之销毁，无需解绑。
  if (input._headBound) return;
  input._headBound = true;

  // 竖栏整栏可滚动（overflow-y:auto 会裁剪栏内浮层），把结果浮层 portal 到 <body>，
  // position:fixed 跟随搜索框（同 home.js 的 tagcloud popover 手法）。
  panel._wrap = wrap; // 记住宿主，供跨页清理与"点外关闭"判定
  document.body.appendChild(panel);
  const place = () => {
    const r = wrap.getBoundingClientRect();
    panel.style.top = `${Math.round(r.bottom + 8)}px`;
    panel.style.left = `${Math.round(r.left)}px`;
  };

  let items = [];
  let active = -1;
  let token = 0;
  let debTimer = null;
  let pfReady = false;

  const setExpanded = (v) => input.setAttribute("aria-expanded", v ? "true" : "false");

  function close() {
    panel.hidden = true;
    panel.innerHTML = "";
    items = [];
    active = -1;
    setExpanded(false);
    input.removeAttribute("aria-activedescendant");
  }

  // 加载中 / 失败 等单行提示（无可选项）
  function status(text) {
    panel.innerHTML = `<div class="hdr-search-status">${text}</div>`;
    place();
    panel.hidden = false;
    items = [];
    active = -1;
    setExpanded(true);
    input.removeAttribute("aria-activedescendant");
  }

  function render(results, term) {
    if (!results.length) {
      panel.innerHTML = '<div class="hdr-search-empty">没有找到相关结果</div>';
      place();
      panel.hidden = false;
      items = [];
      active = -1;
      setExpanded(true);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    const rows = results
      .map((r, i) => {
        const img =
          r.meta && r.meta.image
            ? `<img src="${escapeHtml(r.meta.image)}" alt="" loading="lazy">`
            : '<span class="hdr-search-noimg"><i class="fa fa-image"></i></span>';
        const title = escapeHtml((r.meta && r.meta.title) || "无标题");
        return (
          `<a class="hdr-search-item" role="option" id="${panelId}Opt${i}" data-i="${i}" href="${escapeHtml(r.url)}">` +
          img +
          '<span class="hdr-search-meta">' +
          `<span class="hdr-search-title">${title}</span>` +
          `<span class="hdr-search-excerpt">${r.excerpt || ""}</span>` +
          "</span></a>"
        );
      })
      .join("");
    panel.innerHTML =
      rows +
      `<a class="hdr-search-all" role="option" id="${panelId}OptAll" href="/search/?q=${encodeURIComponent(term)}">查看全部结果 →</a>`;
    place();
    panel.hidden = false;
    items = Array.prototype.slice.call(
      panel.querySelectorAll(".hdr-search-item, .hdr-search-all"),
    );
    active = -1;
    setExpanded(true);
    input.removeAttribute("aria-activedescendant");
  }

  function setActive(next) {
    if (!items.length) return;
    active = (next + items.length) % items.length;
    items.forEach((el, i) => {
      const on = i === active;
      el.classList.toggle("active", on);
      el.setAttribute("aria-selected", on ? "true" : "false");
    });
    const cur = items[active];
    cur.scrollIntoView({ block: "nearest" });
    if (cur.id) input.setAttribute("aria-activedescendant", cur.id);
  }

  async function run(raw) {
    const term = raw.trim();
    if (!term) {
      close();
      return;
    }
    const my = ++token;
    if (!pfReady) status("搜索中…"); // 仅首次（索引未就绪）显示加载态，避免后续每次输入都闪烁
    const pf = await loadPagefind();
    if (my !== token) return;
    if (!pf) {
      status("搜索暂时不可用");
      return;
    }
    pfReady = true;
    let search;
    try {
      search = await pf.search(term);
    } catch (e) {
      if (my === token) status("搜索暂时不可用");
      return;
    }
    if (!search || my !== token) return; // 被后续输入取代
    const data = await Promise.all(
      search.results.slice(0, 6).map((r) => r.data()),
    );
    if (my !== token) return;
    render(
      data.map((d) => ({ url: d.url, meta: d.meta || {}, excerpt: d.excerpt })),
      term,
    );
  }

  function go(q) {
    const url = `/search/?q=${encodeURIComponent(q)}`;
    if (typeof swup !== "undefined" && swup) swup.navigate(url);
    else window.location.href = url;
  }

  input.addEventListener("input", () => {
    clearTimeout(debTimer);
    const v = input.value;
    debTimer = setTimeout(() => run(v), 220);
  });
  // 点搜索框任意处即聚焦输入框（桌面在竖栏里常驻，移动端在顶栏展开条里）
  wrap.addEventListener("click", (e) => {
    if (e.target.closest(".hdr-search-alt, .hdr-search-panel")) return; // 别抢识图/聚搜与结果项的点击
    input.focus();
  });
  input.addEventListener("blur", () => {
    // 延迟，让点击下拉结果先完成（结果点击会触发 swup 导航）
    setTimeout(() => {
      if (document.activeElement !== input && !input.value.trim()) {
        close();
      }
    }, 150);
  });
  input.addEventListener("focus", () => {
    loadPagefind(); // 聚焦即预热索引，等用户打完字搜索已就绪
    if (input.value.trim() && panel.innerHTML) {
      panel.hidden = false;
      setExpanded(true);
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) items[active].click();
      else if (input.value.trim()) go(input.value.trim());
    } else if (e.key === "Escape") {
      close();
      input.blur();
    }
  });

  // 点击搜索区之外关闭浮层（document 持久，只绑一次；对桌面/移动两个实例通用）。
  // 浮层已 portal 到 body，不在搜索区里，需单独排除，否则点结果项会先被这里关掉。
  if (!document._hdrSearchOutside) {
    document.addEventListener("click", (e) => {
      document.querySelectorAll("body > .hdr-search-panel").forEach((p) => {
        if (p._wrap && !p._wrap.contains(e.target) && !p.contains(e.target)) p.hidden = true;
      });
    });
    document._hdrSearchOutside = true;
  }
}

// 导航分组（<details>）可收纳：开合状态存 localStorage，桌面竖栏与移动抽屉共享
// 同一份记忆（按组标题记）。swup 每次软导航都会重渲两者（分组回到默认展开），
// 这里在每次 page:view 恢复；整页刷新同理。
export function initNavGroups() {
  const groups = document.querySelectorAll("#siteSidebar .hdr-group, #hdrDrawer .hdr-group");
  if (!groups.length) return;
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem("sbGroupsCollapsed") || "[]");
  } catch (e) { /* 坏数据当作全展开 */ }
  const collapsed = new Set(saved);
  groups.forEach((g) => {
    if (g._grpBound) return;
    g._grpBound = true;
    const title = (g.querySelector(".hdr-group-title span") || {}).textContent || "";
    if (!title) return;
    g.open = !collapsed.has(title);
    g.addEventListener("toggle", () => {
      if (g.open) collapsed.delete(title);
      else collapsed.add(title);
      localStorage.setItem("sbGroupsCollapsed", JSON.stringify([...collapsed]));
    });
  });
}
