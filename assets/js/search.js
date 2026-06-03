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

// “更多”下拉是纯 CSS 开合；这里只把开合状态同步到 aria-expanded（键盘/读屏可感知）。
export function initHeadNav() {
  const more = document.querySelector(".hdr-more");
  const btn = more && more.querySelector(".hdr-more-btn");
  if (!more || !btn || more._navBound) return;
  more._navBound = true;
  const sync = (open) => btn.setAttribute("aria-expanded", open ? "true" : "false");
  more.addEventListener("mouseenter", () => sync(true));
  more.addEventListener("mouseleave", () => sync(false));
  more.addEventListener("focusin", () => sync(true));
  more.addEventListener("focusout", () => sync(false));
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
    // 首页（当前页含 .home-hero）滚动到顶时透明覆盖，否则实色毛玻璃。
    // 排除 swup 平行过渡期间残留的“上一页”容器，避免从首页切走时仍被误判为首页。
    if (document.querySelector("main:not(.is-previous-container) .home-hero") && y < 30)
      header.classList.add("nav-top");
    else header.classList.remove("nav-top");
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

export function initHeadSearch() {
  const wrap = document.getElementById("hdrSearch");
  const input = document.getElementById("hdrSearchInput");
  const panel = document.getElementById("hdrSearchPanel");
  if (!wrap || !input || !panel) return;
  // swup 软导航会重渲 header（新元素无标记）；旧元素随之销毁，无需解绑。
  if (input._headBound) return;
  input._headBound = true;

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
    panel.hidden = false;
    items = [];
    active = -1;
    setExpanded(true);
    input.removeAttribute("aria-activedescendant");
  }

  function render(results, term) {
    if (!results.length) {
      panel.innerHTML = '<div class="hdr-search-empty">没有找到相关结果</div>';
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
          `<a class="hdr-search-item" role="option" id="hdrSearchOpt${i}" data-i="${i}" href="${escapeHtml(r.url)}">` +
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
      `<a class="hdr-search-all" role="option" id="hdrSearchOptAll" href="/search/?q=${encodeURIComponent(term)}">查看全部结果 →</a>`;
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
  // 桌面：搜索默认收成放大镜图标，点击展开为输入框；失焦且空时收回。
  // （移动端 .hdr-search 整体 display:none，由顶栏 .hdr-msearch 跳 /search，不走这套）
  wrap.addEventListener("click", () => {
    if (!wrap.classList.contains("expanded")) {
      wrap.classList.add("expanded");
      input.focus();
    }
  });
  input.addEventListener("blur", () => {
    // 延迟，让点击下拉结果先完成（结果点击会触发 swup 导航）
    setTimeout(() => {
      if (document.activeElement !== input && !input.value.trim()) {
        wrap.classList.remove("expanded");
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

  // 点击搜索区之外关闭浮层（document 持久，只绑一次）
  if (!document._hdrSearchOutside) {
    document.addEventListener("click", (e) => {
      const w = document.getElementById("hdrSearch");
      const p = document.getElementById("hdrSearchPanel");
      if (w && p && !w.contains(e.target)) p.hidden = true;
    });
    document._hdrSearchOutside = true;
  }
}
