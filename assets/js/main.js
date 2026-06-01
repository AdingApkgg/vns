import {
  initHomeReroll,
  initHomeReveal,
  initHomeCountUp,
  initHomeAnnounce,
  initHomePlaylist,
  initHomeRecentFilter,
  initBusuanziMirror,
  initTagcloudPopover,
  initHomeSpotlightReroll,
} from "./home.js";
import { initAIReview } from "./ai-review.js";
import { mouseFirework, initLozad, initMediumZoom } from "./media.js";
import { initSearch, initGalPopup, rv, shortcutKey } from "./search.js";
import { initTOCSidebar, initPostSubmissionForm, initValine, fetchDLS, initRankPage } from "./pages.js";
import { lunar } from "./lunar.js";
import { langCode, initClipboard } from "./misc.js";

function initializePage() {
  try {
    initGalPopup();
    initMenuToggle();
    lunar();
    initScrollEffects();
    initLozad();
    mouseFirework();
    initMediumZoom();
    rv();
    initHomeReroll();
    initHomeReveal();
    initHomeCountUp();
    initHomeAnnounce();
    initHomePlaylist();
    initHomeRecentFilter();
    initHomeSpotlightReroll();
    initTagcloudPopover();
    initBusuanziMirror();
    initValine();
    if (window.initCommentTabs) window.initCommentTabs();
    initSearch();
    shortcutKey();
    langCode();
    initClipboard();
    fetchDLS();
    initRankPage();
    initAIReview();
    initTOCSidebar();
    initPostSubmissionForm();
  } catch (e) {
    console.error("initializePage error:", e);
  } finally {
    endLoading();
  }
}

/**
 * 初始化 TOC 侧边栏
 */

/**
 * 页面加载状态管理
 */
const PageLoader = {
  el: null,
  startTime: null,
  minDuration: 500,
  closeDuration: 320,
  minCloseProgress: 180,
  phase: "closed",
  _hideTimerId: null,
  _closeTimerId: null,
  _doorDurationTimerId: null,

  getEl() {
    if (!this.el) {
      this.el = document.getElementById("loader");
    }
    return this.el;
  },

  start() {
    // 取消之前的延迟隐藏定时器
    if (this._hideTimerId) {
      clearTimeout(this._hideTimerId);
      this._hideTimerId = null;
    }
    if (this._closeTimerId) {
      clearTimeout(this._closeTimerId);
      this._closeTimerId = null;
    }
    if (this._doorDurationTimerId) {
      clearTimeout(this._doorDurationTimerId);
      this._doorDurationTimerId = null;
    }
    this.startTime = Date.now();
    this.phase = "closing";
    var el = this.getEl();
    if (el) {
      el.style.removeProperty("--loader-door-duration");
      el.classList.remove("loading");
    }

    var self = this;
    this._closeTimerId = setTimeout(function () {
      self._closeTimerId = null;
      if (self.phase === "closing") {
        self.phase = "closed";
      }
    }, this.closeDuration);
  },

  hide(doorDurationMs) {
    if (this._closeTimerId) {
      clearTimeout(this._closeTimerId);
      this._closeTimerId = null;
    }
    if (this._doorDurationTimerId) {
      clearTimeout(this._doorDurationTimerId);
      this._doorDurationTimerId = null;
    }
    this.startTime = null;
    this.phase = "opened";
    document.body.style.overflow = "auto";
    var el = this.getEl();
    if (el) {
      if (typeof doorDurationMs === "number") {
        var appliedDoorDuration = Math.max(180, Math.round(doorDurationMs));
        el.style.setProperty(
          "--loader-door-duration",
          appliedDoorDuration + "ms",
        );
        var self = this;
        this._doorDurationTimerId = setTimeout(function () {
          self._doorDurationTimerId = null;
          var cur = self.getEl();
          if (cur) {
            cur.style.removeProperty("--loader-door-duration");
          }
        }, appliedDoorDuration + 40);
      } else {
        el.style.removeProperty("--loader-door-duration");
      }
      el.classList.add("loading");
    }
  },

  hideFromClosingElapsed(closingElapsed) {
    var ratio = Math.min(1, Math.max(0, closingElapsed / this.closeDuration));
    this.hide(this.closeDuration * ratio);
  },

  end() {
    // 如果已经有延迟隐藏在进行中，不重复处理
    if (this._hideTimerId && this.phase !== "closing") {
      return;
    }

    if (!this.startTime) {
      this.hide();
      return;
    }

    // 关门中已经加载完成：从当前位置反向开门
    if (this.phase === "closing") {
      var closingElapsed = Date.now() - this.startTime;
      if (closingElapsed >= this.minCloseProgress) {
        this.hideFromClosingElapsed(closingElapsed);
      } else {
        var self = this;
        this._hideTimerId = setTimeout(function () {
          self._hideTimerId = null;
          // 若期间又进入了新的 start，不执行本次开门
          if (self.phase === "closing") {
            self.hideFromClosingElapsed(Date.now() - self.startTime);
          }
        }, this.minCloseProgress - closingElapsed);
      }
      return;
    }

    var elapsed = Date.now() - this.startTime;

    if (elapsed >= this.minDuration) {
      this.hide();
    } else {
      // 延迟到最小持续时间后再隐藏
      var remaining = this.minDuration - elapsed;
      var self = this;
      this._hideTimerId = setTimeout(function () {
        self._hideTimerId = null;
        self.hide();
      }, remaining);
    }
  },
};

// 兼容旧代码的别名
function startLoading() {
  PageLoader.start();
}
function endLoading() {
  PageLoader.end();
}

// 初始化 loader 点击事件
(function () {
  var el = document.getElementById("loader");
  if (el) {
    el.addEventListener("click", endLoading);
  }
})();

/**
 * Swup 页面切换钩子
 */
const SwupHooks = {
  init() {
    // 页面切换动画开始时显示加载状态
    swup.hooks.on("animation:out:start", () => {
      PageLoader.start();
    });

    // 新页面资源加载完成（早于 content:replace）时，尽早触发开门逻辑
    swup.hooks.on("page:load", () => {
      PageLoader.end();
    });

    // 页面内容替换后执行
    swup.hooks.on("content:replace", () => {
      Navigation.close();
      bszRe();
      PageLoader.end();
    });

    // 新页面视图加载后初始化页面功能
    swup.hooks.on("page:view", () => {
      initializePage();
    });
  },
};

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  initializePage();
  bszRe();
});
SwupHooks.init();


function bszRe() {
  var bszAPI =
    document.querySelector('meta[name="bsz-api"]')?.content;
  if (!bszAPI) return;

  fetch(bszAPI, {
    method: "POST",
    credentials: "include",
    headers: { "x-bsz-referer": location.href },
  })
    .then((r) => r.json())
    .then(({ success, data }) => {
      if (!success) return;
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      set("busuanzi_value_site_pv", data.site_pv);
      set("busuanzi_value_site_uv", data.site_uv);
      set("busuanzi_value_page_pv", data.page_pv);
    })
    .catch(() => {});

  document.querySelectorAll("[data-bsz-href]").forEach((el) => {
    fetch(bszAPI, {
      headers: { "x-bsz-referer": el.dataset.bszHref },
    })
      .then((r) => r.json())
      .then(({ success, data }) => {
        if (success) el.textContent = data.page_pv;
      })
      .catch(() => {});
  });
}

/**
 * 导航栏控制
 * 支持 data-target 属性指定目标元素
 */
const Navigation = {
  header: null,
  menuToggle: null,
  overlay: null,
  isOpen: false,
  _initialized: false,

  init() {
    var newMenuToggle = document.getElementById("menuToggle");
    if (!newMenuToggle) return;

    var targetSelector = newMenuToggle.dataset.target || "header";
    var newHeader = document.querySelector(targetSelector);
    if (!newHeader) return;

    this.menuToggle = newMenuToggle;
    this.header = newHeader;
    this.overlay = document.getElementById("navOverlay");

    if (!this.menuToggle._navBound) {
      var self = this;
      this.menuToggle.addEventListener("click", function () {
        self.toggle();
      });
      this.menuToggle._navBound = true;
    }

    if (this.overlay && !this.overlay._navBound) {
      var self = this;
      this.overlay.addEventListener("click", function () {
        self.close();
      });
      this.overlay._navBound = true;
    }

    if (!this._initialized) {
      var self = this;
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && self.isOpen) self.close();
      });
      this._initialized = true;
    }
  },

  toggle() {
    this.isOpen = !this.isOpen;
    this.header.classList.toggle("active", this.isOpen);
    if (this.overlay) this.overlay.classList.toggle("active", this.isOpen);
    this.menuToggle.setAttribute("aria-expanded", this.isOpen);
  },

  close() {
    this.isOpen = false;
    this.header.classList.remove("active");
    if (this.overlay) this.overlay.classList.remove("active");
    this.menuToggle.setAttribute("aria-expanded", "false");
  },
};

/**
 * 返回顶部按钮
 */
const BackToTop = {
  button: null,
  showThreshold: 300,
  isVisible: false,

  init() {
    this.button = document.getElementById("back-to-top");
    if (!this.button) return;

    this.button.addEventListener("click", () => this.scrollToTop());
    window.addEventListener("scroll", () => this.handleScroll(), {
      passive: true,
    });

    // 初始状态检查
    this.handleScroll();
  },

  handleScroll() {
    const shouldShow = window.scrollY > this.showThreshold;
    if (shouldShow === this.isVisible) return; // 避免重复操作

    this.isVisible = shouldShow;
    this.button.classList.toggle("show", shouldShow);
  },

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};

// 兼容旧代码的别名
function initMenuToggle() {
  Navigation.init();
}

function initScrollEffects() {
  BackToTop.init();
}








/**
 * 初始化 Valine 评论系统
 * 使用防抖机制避免 swup 页面切换时多次调用
 */


if (
  window.localStorage.getItem("fpson") == undefined ||
  window.localStorage.getItem("fpson") == "1"
) {
  var rAF = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
  var frame = 0;
  var allFrameCount = 0;
  var lastTime = Date.now();
  var lastFameTime = Date.now();
  var loop = function () {
    var now = Date.now();
    var fs = now - lastFameTime;
    var fps = Math.round(1000 / fs);
    lastFameTime = now;
    allFrameCount++;
    frame++;
    if (now > 1000 + lastTime) {
      var fps = Math.round((frame * 1000) / (now - lastTime));
      if (fps <= 5) {
        var kd = `<span style="color:#bd0000">卡成ppt🤢</span>`;
      } else if (fps <= 15) {
        var kd = `<span style="color:red">电竞级帧率😖</span>`;
      } else if (fps <= 25) {
        var kd = `<span style="color:orange">有点难受😨</span>`;
      } else if (fps < 35) {
        var kd = `<span style="color:#9338e6">不太流畅🙄</span>`;
      } else if (fps <= 45) {
        var kd = `<span style="color:#08b7e4">还不错哦😁</span>`;
      } else {
        var kd = `<span style="color:#39c5bb">十分流畅🤣</span>`;
      }
      document.getElementById("fps").innerHTML = `FPS:${fps} ${kd}`;
      frame = 0;
      lastTime = now;
    }
    rAF(loop);
  };
  loop();
} else {
  document.getElementById("fps").style = "display:none!important";
}

const observer = new MutationObserver(function (mutations) {
  const lrcButton = document.querySelector(".aplayer-icon-lrc");
  if (lrcButton) {
    setTimeout(function () {
      lrcButton.click();
    }, 1);
    observer.disconnect();
  }
});

observer.observe(document, {
  childList: true,
  subtree: true,
});



// 排行榜功能

