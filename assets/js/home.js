// 首页交互模块：所有 initHome* + 标签云浮窗 + 不蒜子镜像
// 依赖外部全局：Swal (sweetalert2), navigator.clipboard, IntersectionObserver, MutationObserver

// ========== 私有 helpers ==========

function _esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function _readPool(selector) {
  const n = document.querySelector(selector);
  if (!n) return null;
  try {
    return JSON.parse(n.textContent);
  } catch {
    return null;
  }
}

// FNV-1a + mulberry32 用于"今日 Play"日期种子随机
function _dateHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function _mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function _seededShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function _playlistCardHTML(p) {
  const cover = p.c
    ? `<img class="spotlight-cover" src="${_esc(p.c)}" alt="${_esc(p.t)}" loading="lazy" />`
    : "";
  return `<a class="spotlight-card playlist-card" href="${_esc(p.u)}" title="${_esc(p.t)}">
    ${cover}
    <span class="spotlight-title"><span>${_esc(p.t)}</span></span>
  </a>`;
}

// ========== 主页：今日邀引（3 大卡 reroll）==========

export function initHomeReroll() {
  const btn = document.querySelector('[data-reroll-pool="featured"]');
  const grid = document.querySelector('[data-reroll-target="featured"]');
  const poolNode = document.querySelector("script[data-home-pool]");
  if (!btn || !grid || !poolNode) return;
  let pool;
  try {
    pool = JSON.parse(poolNode.textContent);
  } catch {
    return;
  }
  if (!Array.isArray(pool) || pool.length === 0) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  btn.addEventListener("click", () => {
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);
    grid.style.opacity = "0.3";
    setTimeout(() => {
      grid.innerHTML = picks
        .map(
          (p) => `
        <a class="featured-card" href="${esc(p.u)}">
          ${p.c ? `<img class="featured-cover" src="${esc(p.c)}" alt="${esc(p.t)}" loading="lazy" />` : ""}
          <span class="featured-title"><span>${esc(p.t)}</span></span>
        </a>
      `
        )
        .join("");
      grid.style.opacity = "1";
    }, 180);
  });
}

// ========== 主页：滚动入场动画 ==========

export function initHomeReveal() {
  const targets = document.querySelectorAll(
    ".home-statusbar, .home-announce, .home-playlist, .home-featured, .home-spotlight, .home-recent, .home-stats, .home-tagcloud"
  );
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((t) => io.observe(t));
}

// ========== 主页：数字 count-up ==========

export function initHomeCountUp() {
  const nums = document.querySelectorAll(".stat-num");
  if (!nums.length) return;
  if (!("IntersectionObserver" in window)) return;

  const animate = (el, to) => {
    const duration = 900;
    const start = performance.now();
    const startVal = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(startVal + (to - startVal) * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const text = el.textContent.trim();
        const n = parseInt(text.replace(/[^\d-]/g, ""), 10);
        if (Number.isFinite(n) && n > 0) animate(el, n);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((n) => io.observe(n));
}

// ========== 主页：公告区帮助手风琴 ==========

export function initHomeAnnounce() {
  const announce = document.querySelector(".home-announce");
  if (!announce) return;
  const headings = announce.querySelectorAll(":scope > h2");
  headings.forEach((h2, idx) => {
    const details = document.createElement("details");
    details.className = "announce-section";
    if (idx === 0) details.open = false;
    const summary = document.createElement("summary");
    summary.innerHTML = h2.innerHTML;
    details.appendChild(summary);

    const toMove = [];
    let next = h2.nextElementSibling;
    while (next && next.tagName !== "H2") {
      toMove.push(next);
      next = next.nextElementSibling;
    }
    h2.parentNode.insertBefore(details, h2);
    toMove.forEach((el) => details.appendChild(el));
    h2.remove();
  });
}

// ========== 主页：今日 Play 清单（按日子 seed）==========

export function initHomePlaylist() {
  const section = document.querySelector(".home-playlist");
  if (!section) return;
  const target = section.querySelector("[data-playlist-target]");
  const dateLabel = section.querySelector("[data-playlist-date]");
  const rerollBtn = section.querySelector("[data-playlist-reroll]");
  const shareBtn = section.querySelector("[data-playlist-share]");
  const pool = _readPool("script[data-home-full-pool]");
  if (!target || !pool || !pool.length) return;

  const urlParams = new URLSearchParams(location.search);
  let cursor = (() => {
    const raw = urlParams.get("date");
    if (raw) {
      const d = new Date(raw + "T00:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  })();

  function render() {
    const ymd = _ymd(cursor);
    const rng = _mulberry32(_dateHash(ymd));
    const picks = _seededShuffle(pool, rng).slice(0, 6);
    if (dateLabel) {
      dateLabel.textContent = ymd.slice(2).replace(/-/g, ".");
    }
    target.innerHTML = picks.map(_playlistCardHTML).join("");
  }

  render();

  if (rerollBtn) {
    rerollBtn.addEventListener("click", () => {
      cursor = new Date(cursor.getTime() + 24 * 3600 * 1000);
      target.style.opacity = "0.4";
      setTimeout(() => {
        render();
        target.style.opacity = "1";
      }, 180);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const url = `${location.origin}${location.pathname}?date=${_ymd(cursor)}`;
      const fb = () => prompt("复制以下链接：", url);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(() => {
            if (typeof Swal !== "undefined") {
              Swal.fire({
                icon: "success",
                title: "已复制",
                text: url,
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2500,
              });
            }
          })
          .catch(fb);
      } else {
        fb();
      }
    });
  }
}

// ========== 主页：近期更新筛选 chip ==========

export function initHomeRecentFilter() {
  const section = document.querySelector(".home-recent");
  if (!section) return;
  const chipsWrap = section.querySelector("[data-recent-chips]");
  const target = section.querySelector("[data-recent-target]");
  const pool = _readPool("script[data-home-full-pool]");
  if (!chipsWrap || !target || !pool || !pool.length) return;

  function renderCardHTML(p) {
    const cover = p.c
      ? `<img class="recent-cover" src="${_esc(p.c)}" alt="${_esc(p.t)}" loading="lazy" />`
      : "";
    return `<a class="recent-card" href="${_esc(p.u)}" title="${_esc(p.t)}">
      ${cover}
      <span class="recent-title"><span>${_esc(p.t)}</span></span>
    </a>`;
  }

  function apply(filter) {
    let items = pool.slice();
    if (filter) {
      const [k, v] = filter.split(":");
      items = items.filter((p) => {
        const arr = p[k];
        return Array.isArray(arr) && arr.includes(v);
      });
    }
    items.sort((a, b) => (b.m || 0) - (a.m || 0));
    items = items.slice(0, 6);
    if (!items.length) {
      target.innerHTML = `<div class="recent-empty">该筛选下没有作品</div>`;
      return;
    }
    target.style.opacity = "0.4";
    setTimeout(() => {
      target.innerHTML = items.map(renderCardHTML).join("");
      target.style.opacity = "1";
    }, 160);
  }

  chipsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".recent-chip");
    if (!btn) return;
    chipsWrap
      .querySelectorAll(".recent-chip")
      .forEach((c) => c.classList.toggle("is-active", c === btn));
    apply(btn.dataset.filter || "");
  });
}

// ========== 主页：不蒜子计数器镜像（footer → statusbar）==========

export function initBusuanziMirror() {
  // 不蒜子只往第一个匹配 id 注入。footer 是默认承载点
  // (#busuanzi_value_site_pv / #busuanzi_value_site_uv)，statusbar 用
  // data-busuanzi-mirror 属性从 footer 镜像。
  const mirrors = document.querySelectorAll("[data-busuanzi-mirror]");
  if (!mirrors.length) return;
  mirrors.forEach((dst) => {
    const srcId = dst.getAttribute("data-busuanzi-mirror");
    const src = document.getElementById(srcId);
    if (!src) return;
    const sync = () => {
      const v = (src.textContent || "").trim();
      if (v && v !== "…" && v.toLowerCase() !== "null") {
        dst.textContent = v;
      }
    };
    sync();
    new MutationObserver(sync).observe(src, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
}

// ========== 主页：标签云 hover 浮窗（portal 到 body）==========

export function initTagcloudPopover() {
  // 父级 .swup-parallel { overflow: hidden } + .home-tagcloud 有 transform（入场动画）
  // 会把 popover 的 position:fixed containing block 锁定到祖先而非 viewport。
  // 解决：把 popover 移到 <body> 末尾（portal），位置由 JS 计算，visibility 用 .is-active 控制。
  const wraps = document.querySelectorAll(".tagcloud-tag-wrap");
  if (!wraps.length) return;

  wraps.forEach((wrap) => {
    const pop = wrap.querySelector(":scope > .tagcloud-popover");
    if (!pop) return;

    document.body.appendChild(pop);

    const reposition = () => {
      const r = wrap.getBoundingClientRect();
      pop.style.position = "fixed";
      pop.style.left = r.left + r.width / 2 + "px";
      if (wrap.hasAttribute("data-popover-below")) {
        pop.style.top = r.bottom + "px";
        pop.style.bottom = "auto";
        pop.style.transform = "translateX(-50%) translateY(0)";
      } else {
        pop.style.top = r.top + "px";
        pop.style.bottom = "auto";
        pop.style.transform = "translateX(-50%) translateY(-100%)";
      }
    };

    let active = false;
    let hideTimer = 0;
    const show = () => {
      clearTimeout(hideTimer);
      reposition();
      pop.classList.add("is-active");
      active = true;
    };
    const hide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        pop.classList.remove("is-active");
        active = false;
      }, 80);
    };

    wrap.addEventListener("mouseenter", show);
    wrap.addEventListener("mouseleave", hide);
    pop.addEventListener("mouseenter", show);
    pop.addEventListener("mouseleave", hide);

    const onUpdate = () => {
      if (active) reposition();
    };
    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
  });
}

// ========== 主页：今日话题"换个话题"按钮 ==========

export function initHomeSpotlightReroll() {
  const section = document.querySelector(".home-spotlight");
  if (!section) return;
  const btn = section.querySelector("[data-spotlight-reroll]");
  const target = section.querySelector("[data-spotlight-target]");
  const tagLink = section.querySelector("[data-spotlight-tag]");
  const countEl = section.querySelector("[data-spotlight-count]");
  const pool = _readPool("script[data-home-tag-pool]");
  if (!btn || !target || !tagLink || !pool || !pool.length) return;

  let currentName = tagLink.textContent.trim();

  function renderCardHTML(p) {
    const cover = p.c
      ? `<img class="spotlight-cover" src="${_esc(p.c)}" alt="${_esc(p.t)}" loading="lazy" />`
      : "";
    const tags = (p.g || [])
      .slice(0, 3)
      .map((t) => `<span class="card-tag">${_esc(t)}</span>`)
      .join("");
    const tagWrap = tags ? `<span class="card-tags">${tags}</span>` : "";
    return `<a class="spotlight-card" href="${_esc(p.u)}" title="${_esc(p.t)}">
      ${cover}
      <span class="spotlight-title"><span>${_esc(p.t)}</span></span>
      ${tagWrap}
    </a>`;
  }

  btn.addEventListener("click", () => {
    const candidates = pool.filter((t) => t.n !== currentName && t.p && t.p.length);
    if (!candidates.length) return;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    currentName = next.n;
    target.style.opacity = "0.3";
    setTimeout(() => {
      tagLink.textContent = next.n;
      tagLink.setAttribute("href", next.u);
      if (countEl) countEl.textContent = `${next.c} 部作品`;
      target.innerHTML = next.p.map(renderCardHTML).join("");
      target.style.opacity = "1";
    }, 180);
  });
}
