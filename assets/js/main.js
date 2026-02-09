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
    initValine();
    initSearch();
    shortcutKey();
    langCode();
    initClipboard();
    fetchDLS();
    initRankPage();
    initAIReview();
    initTOCSidebar();
  } catch (e) {
    console.error("initializePage error:", e);
  } finally {
    endLoading();
  }
}

/**
 * 初始化 TOC 侧边栏
 */
function initTOCSidebar() {
  const trigger = document.getElementById("toc-trigger");
  const overlay = document.getElementById("toc-overlay");
  const sidebar = document.getElementById("toc-sidebar");
  const closeBtn = document.getElementById("toc-close");

  if (!trigger || !sidebar) return;

  // 延迟添加 ready 类，避免页面加载时闪现
  requestAnimationFrame(() => {
    sidebar.classList.add("ready");
  });

  const openTOC = () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeTOC = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  trigger.addEventListener("click", openTOC);
  overlay.addEventListener("click", closeTOC);
  closeBtn.addEventListener("click", closeTOC);

  // ESC 键关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeTOC();
    }
  });

  // 初始化折叠功能
  const toc = sidebar.querySelector("#TableOfContents");
  if (toc) {
    // 标记有子项的 li（支持 ul 和 ol）
    toc.querySelectorAll("li").forEach((li) => {
      const childList = li.querySelector(":scope > ul, :scope > ol");
      if (childList) {
        li.classList.add("has-children");

        // 点击父项时切换折叠状态
        const link = li.querySelector(":scope > a");
        if (link) {
          link.addEventListener("click", (e) => {
            // 如果有子项，先切换折叠状态
            e.preventDefault();
            li.classList.toggle("open");
          });
        }
      } else {
        // 没有子项的链接，点击后关闭 TOC
        const link = li.querySelector("a");
        if (link) {
          link.addEventListener("click", () => {
            closeTOC();
          });
        }
      }
    });

    // 默认展开第一级（支持 ul 和 ol）
    const firstLevel = toc.querySelector(
      ":scope > ul > li.has-children, :scope > ol > li.has-children"
    );
    if (firstLevel) {
      firstLevel.classList.add("open");
    }
  }
}

/**
 * 页面加载状态管理
 */
const PageLoader = {
  el: null,
  startTime: null,
  minDuration: 500,
  _hideTimerId: null,

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
    this.startTime = Date.now();
    var el = this.getEl();
    if (el) {
      el.classList.remove("loading");
    }
  },

  hide() {
    document.body.style.overflow = "auto";
    var el = this.getEl();
    if (el) {
      el.classList.add("loading");
    }
  },

  end() {
    // 如果已经有延迟隐藏在进行中，不重复处理
    if (this._hideTimerId) {
      return;
    }

    if (!this.startTime) {
      this.hide();
      return;
    }

    var elapsed = Date.now() - this.startTime;
    this.startTime = null;

    if (elapsed >= this.minDuration) {
      this.hide();
    } else {
      // 延迟到最小持续时间后再隐藏
      var remaining = this.minDuration - elapsed;
      var self = this;
      this._hideTimerId = setTimeout(function() {
        self._hideTimerId = null;
        self.hide();
      }, remaining);
    }
  },
};

// 兼容旧代码的别名
function startLoading() { PageLoader.start(); }
function endLoading() { PageLoader.end(); }

// 初始化 loader 点击事件
(function() {
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

    // 页面内容替换后执行
    swup.hooks.on("content:replace", () => {
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
document.addEventListener("DOMContentLoaded", initializePage);
SwupHooks.init();

function mouseFirework() {
  firework({
    excludeElements: [],
    particles: [
      {
        shape: "circle",
        move: ["emit"],
        easing: "easeOutExpo",
        colors: [
          "rgba(255,182,185,.9)",
          "rgba(250,227,217,.9)",
          "rgba(187,222,214,.9)",
          "rgba(138,198,209,.9)",
        ],
        number: 30,
        duration: [1200, 1800],
        shapeOptions: {
          radius: [16, 32],
        },
      },
      {
        shape: "circle",
        move: ["diffuse"],
        easing: "easeOutExpo",
        colors: ["#FFF"],
        number: 1,
        duration: [1200, 1800],
        shapeOptions: {
          radius: 20,
          alpha: 0.5,
          lineWidth: 6,
        },
      },
    ],
  });
}

function initLozad() {
  const el = document.querySelectorAll("img");
  const observerLozad = lozad(el);
  observerLozad.observe();
}

/**
 * 初始化 medium-zoom 图片缩放
 */
function initMediumZoom() {
  if (typeof mediumZoom === "undefined") return;
  
  // 销毁之前的实例（如果存在）
  if (window._mediumZoomInstance) {
    window._mediumZoomInstance.detach();
  }
  
  // 创建新实例
  window._mediumZoomInstance = mediumZoom("[data-zoomable]", {
    margin: 24,
    background: "rgba(0, 0, 0, 0.9)",
    scrollOffset: 40,
  });
}

function bszRe() {
  bszCaller.fetch(
    "//busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback",
    function (a) {
      bszTag.texts(a);
      bszTag.shows();
    }
  );
}

/**
 * 导航栏控制
 * 支持 data-target 属性指定目标元素
 */
const Navigation = {
  header: null,
  menuToggle: null,
  fixedThreshold: 200,
  isOpen: false,
  _scrollInitialized: false,

  init() {
    var newMenuToggle = document.getElementById("menuToggle");
    if (!newMenuToggle) return;

    // 从 data-target 获取目标元素，默认为 header
    var targetSelector = newMenuToggle.dataset.target || "header";
    var newHeader = document.querySelector(targetSelector);
    if (!newHeader) return;

    this.menuToggle = newMenuToggle;
    this.header = newHeader;

    // 使用 data 属性标记是否已绑定事件，避免重复绑定
    if (!this.menuToggle._navBound) {
      var self = this;
      this.menuToggle.addEventListener("click", function() { self.toggle(); });
      this.menuToggle._navBound = true;
    }
    
    // scroll 和 keydown 事件只需要绑定一次
    if (!this._scrollInitialized) {
      var self = this;
      window.addEventListener("scroll", function() { self.handleScroll(); }, { passive: true });
      
      // ESC 键关闭菜单
      document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && self.isOpen) self.close();
      });
      
      this._scrollInitialized = true;
    }
  },

  toggle() {
    this.isOpen = !this.isOpen;
    this.header.classList.toggle("active", this.isOpen);
    this.menuToggle.setAttribute("aria-expanded", this.isOpen);
  },

  close() {
    this.isOpen = false;
    this.header.classList.remove("active");
    this.menuToggle.setAttribute("aria-expanded", "false");
  },

  handleScroll() {
    if (!this.header) return;
    var isFixed = window.scrollY > this.fixedThreshold;
    this.header.classList.toggle("fixed", isFixed);
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
    window.addEventListener("scroll", () => this.handleScroll(), { passive: true });

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

function initSearch() {
  var searchContainer = document.querySelector("#search");
  if (searchContainer) {
    var pagefind = new PagefindUI({
      element: "#search",
      pageSize: 10,
      showSubResults: true,
      resetStyles: false,
    });
    
    // 支持 URL 参数直接搜索，如 /search/?q=keyword
    var urlParams = new URLSearchParams(window.location.search);
    var query = urlParams.get("q");
    if (query) {
      // 延迟确保 PagefindUI 完全初始化
      setTimeout(function() {
        var searchInput = searchContainer.querySelector(".pagefind-ui__search-input");
        if (searchInput) {
          searchInput.value = query;
          // 触发 input 事件让 PagefindUI 执行搜索
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 100);
    }
  }
}

function initGalPopup() {
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

function displayResults(results) {
  searchResults.innerHTML = "";
  if (results.length === 0) {
    searchResults.innerHTML = "<p>No results found.</p>";
    return;
  }
  const ul = document.createElement("ul");
  results.forEach((page) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = page.permalink;
    a.innerHTML = highlightText(page.title, searchInput.value);
    li.appendChild(a);
    ul.appendChild(li);
  });
  searchResults.appendChild(ul);
}

function rv() {
  const randomLink = document.querySelector("#item-random");
  if (randomLink) {
    randomLink.addEventListener("click", (e) => {
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
            document.body.innerHTML =
              "<p>No random pages found. Please try again.</p>";
            return;
          }
          const randomUrl = posts[Math.floor(Math.random() * posts.length)];
          swup.navigate(randomUrl);
        })
        .catch((error) => {
          document.body.innerHTML =
            "<p>Error loading random page. Please try again.</p>";
        });
    });
  }
}

function shortcutKey() {
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

function langCode() {
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

function initClipboard() {
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
        setTimeout(() => (e.trigger.innerHTML = '<i class="fa-regular fa-copy"></i>'), 1500);
      });
    })();
  }
}

/**
 * Valine 评论系统配置
 */
const VALINE_CONFIG = {
  appId: "BnlZFCN5ghutLVVEX0el3pz3-MdYXbMMI",
  appKey: "OvpvXLKwajI2qYE4XsNMokpW",
  serverURLs: "https://valine.saop.cc",
  placeholder:
    "昵称栏输入 QQ 号即可获取头像与邮箱..\n评论支持标准的 Markdown 全语法~",
  avatar_cdn: "https://weavatar.com/avatar/",
  emojiCDN: "//twikoo-magic.oss-cn-hangzhou.aliyuncs.com/",
  pageSize: 20,
  visitor: false,
  comment_count: false,
  highlight: true,
  recordIP: true,
  enableQQ: true,
};

/**
 * 生成表情映射
 */
const VALINE_EMOJI_MAPS = (() => {
  const maps = {};

  // QQ 表情
  const qqEmojis = [
    "OK", "aini", "aixin", "aoman", "baiyan", "bangbangtang", "baojin",
    "baoquan", "bishi", "bizui", "cahan", "caidao", "chi", "ciya", "dabing",
    "daku", "dan", "deyi", "doge", "fadai", "fanu", "fendou", "ganga",
    "gouyin", "guzhang", "haixiu", "hanxiao", "haobang", "haqian", "hecai",
    "hexie", "huaixiao", "jie", "jingkong", "jingxi", "jingya", "juhua",
    "keai", "kelian", "koubi", "ku", "kuaikule", "kulou", "kun", "lanqiu",
    "leiben", "lenghan", "liuhan", "liulei", "nanguo", "penxue", "piezui",
    "pijiu", "qiang", "qiaoda", "qinqin", "qiudale", "quantou", "saorao",
    "se", "shengli", "shouqiang", "shuai", "shui", "tiaopi", "touxiao",
    "tu", "tuosai", "weiqu", "weixiao", "woshou", "wozuimei", "wunai",
    "xia", "xiaojiujie", "xiaoku", "xiaoyanger", "xieyanxiao", "xigua",
    "xu", "yangtuo", "yinxian", "yiwen", "youhengheng", "youling", "yun",
    "zaijian", "zhayanjian", "zhemo", "zhouma", "zhuakuang", "zuohengheng",
  ];
  qqEmojis.forEach((name) => {
    maps[`QQ-${name}`] = `QQ/${name}.gif`;
  });

  // 贴吧表情 (1-50, 66-124)
  maps["贴吧新表情-image_emoticon"] = "Tieba-New/image_emoticon.png";
  const tiebaRanges = [
    [2, 50],
    [66, 124],
  ];
  tiebaRanges.forEach(([start, end]) => {
    for (let i = start; i <= end; i++) {
      maps[`贴吧新表情-image_emoticon${i}`] = `Tieba-New/image_emoticon${i}.png`;
    }
  });

  return maps;
})();

// Valine 初始化防抖定时器
let valineInitTimer = null;

/**
 * 初始化 Valine 评论系统
 * 使用防抖机制避免 swup 页面切换时多次调用
 */
function initValine() {
  // 清除之前的定时器，防止重复初始化
  if (valineInitTimer) {
    clearTimeout(valineInitTimer);
  }

  // 延迟执行，确保 swup 页面切换后 DOM 完全准备好
  valineInitTimer = setTimeout(() => {
    const vcommentsEl = document.getElementById("vcomments");
    if (!vcommentsEl) return;

    // 清空之前的内容，确保 swup 页面切换后能重新初始化
    vcommentsEl.innerHTML = "";

    new Valine({
      el: "#vcomments",
      path: window.location.pathname,
      emojiMaps: VALINE_EMOJI_MAPS,
      ...VALINE_CONFIG,
    });
  }, 500);
}

function highlightText(text, query) {
  return text.replace(
    new RegExp(query, "gi"),
    (match) => `<span class="highlight">${match}</span>`
  );
}

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

function lunar() {
  var lunarInfo = [
    19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970,
    19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343,
    18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800,
    25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536,
    54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423,
    27808, 46416, 86869, 19872, 42416, 83315, 21168, 43432, 59728, 27296,
    44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176,
    38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46752, 103846,
    38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256,
    19189, 18800, 25776, 29859, 59984, 27480, 23232, 43872, 38613, 37600,
    51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893,
    43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312,
    31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576,
    23200, 30371, 38608, 19195, 19152, 42192, 118966, 53840, 54560, 56645,
    46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448,
    84835, 37744, 18936, 18800, 25776, 92326, 59984, 27424, 108228, 43744,
    41696, 53987, 51552, 54615, 54432, 55888, 23893, 22176, 42704, 21972,
    21200, 43448, 43344, 46240, 46758, 44368, 21920, 43940, 42416, 21168,
    45683, 26928, 29495, 27296, 44368, 84821, 19296, 42352, 21732, 53600,
    59752, 54560, 55968, 92838, 22224, 19168, 43476, 41680, 53584, 62034,
    54560,
  ],
    solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
    Zhi = [
      "子",
      "丑",
      "寅",
      "卯",
      "辰",
      "巳",
      "午",
      "未",
      "申",
      "酉",
      "戌",
      "亥",
    ],
    Animals = [
      "鼠",
      "牛",
      "虎",
      "兔",
      "龙",
      "蛇",
      "马",
      "羊",
      "猴",
      "鸡",
      "狗",
      "猪",
    ],
    solarTerm = [
      "小寒",
      "大寒",
      "立春",
      "雨水",
      "惊蛰",
      "春分",
      "清明",
      "谷雨",
      "立夏",
      "小满",
      "芒种",
      "夏至",
      "小暑",
      "大暑",
      "立秋",
      "处暑",
      "白露",
      "秋分",
      "寒露",
      "霜降",
      "立冬",
      "小雪",
      "大雪",
      "冬至",
    ],
    sTermInfo = [
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "9778397bd19801ec9210c965cc920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd09801d98082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd197c36c9210c9274c91aa",
      "97b6b97bd19801ec95f8c965cc920e",
      "97bd09801d98082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec95f8c965cc920e",
      "97bcf97c3598082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd07f595b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "9778397bd19801ec9210c9274c920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd07f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd07f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bd07f1487f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c9274c920e",
      "97bcf7f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c91aa",
      "97b6b97bd197c36c9210c9274c920e",
      "97bcf7f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c920e",
      "97b6b7f0e47f531b0723b0b6fb0722",
      "7f0e37f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36b0b70c9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0787b0721",
      "7f0e27f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c91aa",
      "97b6b7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "977837f0e37f149b0723b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f5307f595b0b0bc920fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "977837f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0723b06bd",
      "7f07e7f0e37f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0723b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0723b06bd",
      "7f07e7f0e37f14998083b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14898082b0723b02d5",
      "7f07e7f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e36665b66aa89801e9808297c35",
      "665f67f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e36665b66a449801e9808297c35",
      "665f67f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e36665b66a449801e9808297c35",
      "665f67f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e26665b66a449801e9808297c35",
      "665f67f0e37f1489801eb072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
    ],
    nStr1 = ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
    nStr2 = ["初", "十", "廿", "卅"],
    nStr3 = [
      "正",
      "二",
      "三",
      "四",
      "五",
      "六",
      "七",
      "八",
      "九",
      "十",
      "冬",
      "腊",
    ];

  function lYearDays(b) {
    var f,
      c = 348;
    for (f = 32768; f > 8; f >>= 1) c += lunarInfo[b - 1900] & f ? 1 : 0;
    return c + leapDays(b);
  }

  function leapMonth(b) {
    return 15 & lunarInfo[b - 1900];
  }

  function leapDays(b) {
    return leapMonth(b) ? (65536 & lunarInfo[b - 1900] ? 30 : 29) : 0;
  }

  function monthDays(b, f) {
    return f > 12 || f < 1 ? -1 : lunarInfo[b - 1900] & (65536 >> f) ? 30 : 29;
  }

  function solarDays(b, f) {
    if (f > 12 || f < 1) return -1;
    var c = f - 1;
    return 1 === c
      ? (b % 4 == 0 && b % 100 != 0) || b % 400 == 0
        ? 29
        : 28
      : solarMonth[c];
  }

  function toGanZhiYear(b) {
    var f = (b - 3) % 10,
      c = (b - 3) % 12;
    return 0 === f && (f = 10), 0 === c && (c = 12), Gan[f - 1] + Zhi[c - 1];
  }

  function toAstro(b, f) {
    return (
      "魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯".substr(
        2 * b -
        (f < [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22][b - 1] ? 2 : 0),
        2
      ) + "座"
    );
  }

  function toGanZhi(b) {
    return Gan[b % 10] + Zhi[b % 12];
  }

  function getTerm(b, f) {
    if (b < 1900 || b > 2100) return -1;
    if (f < 1 || f > 24) return -1;
    var c = sTermInfo[b - 1900],
      e = [
        parseInt("0x" + c.substr(0, 5)).toString(),
        parseInt("0x" + c.substr(5, 5)).toString(),
        parseInt("0x" + c.substr(10, 5)).toString(),
        parseInt("0x" + c.substr(15, 5)).toString(),
        parseInt("0x" + c.substr(20, 5)).toString(),
        parseInt("0x" + c.substr(25, 5)).toString(),
      ],
      a = [
        e[0].substr(0, 1),
        e[0].substr(1, 2),
        e[0].substr(3, 1),
        e[0].substr(4, 2),
        e[1].substr(0, 1),
        e[1].substr(1, 2),
        e[1].substr(3, 1),
        e[1].substr(4, 2),
        e[2].substr(0, 1),
        e[2].substr(1, 2),
        e[2].substr(3, 1),
        e[2].substr(4, 2),
        e[3].substr(0, 1),
        e[3].substr(1, 2),
        e[3].substr(3, 1),
        e[3].substr(4, 2),
        e[4].substr(0, 1),
        e[4].substr(1, 2),
        e[4].substr(3, 1),
        e[4].substr(4, 2),
        e[5].substr(0, 1),
        e[5].substr(1, 2),
        e[5].substr(3, 1),
        e[5].substr(4, 2),
      ];
    return parseInt(a[f - 1]);
  }

  function toChinaMonth(b) {
    if (b > 12 || b < 1) return -1;
    var f = nStr3[b - 1];
    return (f += "月");
  }

  function toChinaDay(b) {
    var f;
    switch (b) {
      case 10:
        f = "初十";
        break;
      case 20:
        f = "二十";
        break;
      case 30:
        f = "三十";
        break;
      default:
        (f = nStr2[Math.floor(b / 10)]), (f += nStr1[b % 10]);
    }
    return f;
  }

  function getAnimal(b) {
    return Animals[(b - 4) % 12];
  }

  function solar2lunar(b, f, c) {
    if (b < 1900 || b > 2100) return -1;
    if (1900 === b && 1 === f && c < 31) return -1;
    var e,
      a,
      r = null,
      t = 0;
    (b = (r = b ? new Date(b, parseInt(f) - 1, c) : new Date()).getFullYear()),
      (f = r.getMonth() + 1),
      (c = r.getDate());
    var d =
      (Date.UTC(r.getFullYear(), r.getMonth(), r.getDate()) -
        Date.UTC(1900, 0, 31)) /
      864e5;
    for (e = 1900; e < 2101 && d > 0; e++) d -= t = lYearDays(e);
    d < 0 && ((d += t), e--);
    var n = new Date(),
      s = !1;
    n.getFullYear() === b &&
      n.getMonth() + 1 === f &&
      n.getDate() === c &&
      (s = !0);
    var u = r.getDay(),
      o = nStr1[u];
    0 === u && (u = 7);
    var l = e;
    a = leapMonth(e);
    var i = !1;
    for (e = 1; e < 13 && d > 0; e++)
      a > 0 && e === a + 1 && !1 === i
        ? (--e, (i = !0), (t = leapDays(l)))
        : (t = monthDays(l, e)),
        !0 === i && e === a + 1 && (i = !1),
        (d -= t);
    0 === d && a > 0 && e === a + 1 && (i ? (i = !1) : ((i = !0), --e)),
      d < 0 && ((d += t), --e);
    var h = e,
      D = d + 1,
      g = f - 1,
      v = toGanZhiYear(l),
      y = getTerm(b, 2 * f - 1),
      m = getTerm(b, 2 * f),
      p = toGanZhi(12 * (b - 1900) + f + 11);
    c >= y && (p = toGanZhi(12 * (b - 1900) + f + 12));
    var M = !1,
      T = null;
    y === c && ((M = !0), (T = solarTerm[2 * f - 2])),
      m === c && ((M = !0), (T = solarTerm[2 * f - 1]));
    var I = toGanZhi(
      Date.UTC(b, g, 1, 0, 0, 0, 0) / 864e5 + 25567 + 10 + c - 1
    ),
      C = toAstro(f, c);
    return {
      lYear: l,
      lMonth: h,
      lDay: D,
      Animal: getAnimal(l),
      IMonthCn: (i ? "闰" : "") + toChinaMonth(h),
      IDayCn: toChinaDay(D),
      cYear: b,
      cMonth: f,
      cDay: c,
      gzYear: v,
      gzMonth: p,
      gzDay: I,
      isToday: s,
      isLeap: i,
      nWeek: u,
      ncWeek: "星期" + o,
      isTerm: M,
      Term: T,
      astro: C,
    };
  }
  var calendarFormatter = {
    solar2lunar: function (b, f, c) {
      return solar2lunar(b, f, c);
    },
    lunar2solar: function (b, f, c, e) {
      if ((e = !!e) && leapMonth !== f) return -1;
      if (
        (2100 === b && 12 === f && c > 1) ||
        (1900 === b && 1 === f && c < 31)
      )
        return -1;
      var a = monthDays(b, f),
        r = a;
      if ((e && (r = leapDays(b, f)), b < 1900 || b > 2100 || c > r)) return -1;
      for (var t = 0, d = 1900; d < b; d++) t += lYearDays(d);
      var n = 0,
        s = !1;
      for (d = 1; d < f; d++)
        (n = leapMonth(b)),
          s || (n <= d && n > 0 && ((t += leapDays(b)), (s = !0))),
          (t += monthDays(b, d));
      e && (t += a);
      var u = Date.UTC(1900, 1, 30, 0, 0, 0),
        o = new Date(864e5 * (t + c - 31) + u);
      return solar2lunar(
        o.getUTCFullYear(),
        o.getUTCMonth() + 1,
        o.getUTCDate()
      );
    },
  };

  // 节日弹窗
  var d = new Date();
  m = d.getMonth() + 1;
  dd = d.getDate();
  y = d.getFullYear();

  // 公祭日
  if (m == 9 && dd == 18) {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("style", "filter: grayscale(60%);");
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(
        "今天是九一八事变" +
        (y - 1931).toString() +
        "周年纪念日\n🪔勿忘国耻，振兴中华🪔"
      );
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 7 && dd == 7) {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("style", "filter: grayscale(60%);");
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(
        "今天是卢沟桥事变" +
        (y - 1937).toString() +
        "周年纪念日\n🪔勿忘国耻，振兴中华🪔"
      );
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 12 && dd == 13) {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("style", "filter: grayscale(60%);");
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(
        "今天是南京大屠杀" +
        (y - 1937).toString() +
        "周年纪念日\n🪔勿忘国耻，振兴中华🪔"
      );
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 8 && dd == 14) {
    document
      .getElementsByTagName("html")[0]
      .setAttribute("style", "filter: grayscale(60%);");
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("今天是世界慰安妇纪念日\n🪔勿忘国耻，振兴中华🪔");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }

  // 节假日
  if (m == 10 && dd <= 3) {
    //国庆节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("祝祖国" + (y - 1949).toString() + "岁生日快乐！");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 8 && dd == 15) {
    //搞来玩的，小日子投降
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("小日子已经投降" + (y - 1945).toString() + "年了😃");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 1 && dd == 1) {
    //元旦节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(y.toString() + "年元旦快乐！🎉");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 3 && dd == 8) {
    //妇女节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("各位女神们，妇女节快乐！👩");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  l = [
    "非常抱歉，因为不可控原因，博客将于明天停止运营！",
    "好消息，日本没了！",
    "美国垮了，原因竟然是川普！",
    "微软垮了！",
    "你的电脑已经过载，建议立即关机！",
    "你知道吗？站长很喜欢你哦！",
    "一分钟有61秒哦",
    "你喜欢的人跟别人跑了！",
  ];
  if (m == 4 && dd == 1) {
    //愚人节，随机谎话
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(l[Math.floor(Math.random() * l.length)]);
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 5 && dd == 1) {
    //劳动节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("劳动节快乐\n为各行各业辛勤工作的人们致敬！");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 5 && dd == 4) {
    //青年节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("青年节快乐\n青春不是回忆逝去,而是把握现在！");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 5 && dd == 20) {
    //520
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("今年是520情人节\n快和你喜欢的人一起过吧！💑");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 7 && dd == 1) {
    //建党节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("祝中国共产党" + (y - 1921).toString() + "岁生日快乐！");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 9 && dd == 10) {
    //教师节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("各位老师们教师节快乐！👩‍🏫");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (m == 12 && dd == 25) {
    //圣诞节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("圣诞节快乐！🎄");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }

  //传统节日部分

  if (
    (y == 2023 && m == 4 && dd == 5) ||
    (y == 2024 && m == 4 && dd == 4) ||
    (y == 2025 && m == 4 && dd == 4)
  ) {
    //清明节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("清明时节雨纷纷,一束鲜花祭故人💐");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (
    (y == 2023 && m == 12 && dd == 22) ||
    (y == 2024 && m == 12 && dd == 21) ||
    (y == 2025 && m == 12 && dd == 21)
  ) {
    //冬至
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("冬至快乐\n快吃上一碗热热的汤圆和饺子吧🧆");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }

  var lunar = calendarFormatter.solar2lunar();

  //农历采用汉字计算，防止出现闰月导致问题

  if (
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初六") ||
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初五") ||
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初四") ||
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初三") ||
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初二") ||
    (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "初一") ||
    (lunar["IMonthCn"] == "腊月" && lunar["IDayCn"] == "三十") ||
    (lunar["IMonthCn"] == "腊月" && lunar["IDayCn"] == "廿九")
  ) {
    //春节，本来只有大年三十到初六，但是有时候除夕是大年二十九，所以也加上了
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire(y.toString() + "年新年快乐\n🎊祝你心想事成，诸事顺利🎊");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (lunar["IMonthCn"] == "正月" && lunar["IDayCn"] == "十五") {
    //元宵节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("元宵节快乐\n送你一个大大的灯笼🧅");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (lunar["IMonthCn"] == "五月" && lunar["IDayCn"] == "初五") {
    //端午节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("端午节快乐\n请你吃一条粽子🍙");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (lunar["IMonthCn"] == "七月" && lunar["IDayCn"] == "初七") {
    //七夕节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("七夕节快乐\n黄昏后,柳梢头,牛郎织女来碰头");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (lunar["IMonthCn"] == "八月" && lunar["IDayCn"] == "十五") {
    //中秋节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("中秋节快乐\n请你吃一块月饼🍪");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
  if (lunar["IMonthCn"] == "九月" && lunar["IDayCn"] == "初九") {
    //重阳节
    if (sessionStorage.getItem("isPopupWindow") != "1") {
      Swal.fire("重阳节快乐\n独在异乡为异客，每逢佳节倍思亲");
      sessionStorage.setItem("isPopupWindow", "1");
    }
  }
}

function fetchDLS() {
  if (document.querySelector(".content.dls")) {
    const jsonUrl =
      "https://ghfast.top/https://raw.githubusercontent.com/AdingApkgg/vns/refs/heads/dev/data/dls.json";

    fetch(jsonUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("网络响应失败");
        }
        return response.json();
      })
      .then((data) => {
        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "";
        data.forEach((item) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";

          const cover = document.createElement("img");
          cover.className = "cover";
          cover.src = item.cover;
          cover.alt = item.title;
          cover.title = item.title;
          itemDiv.appendChild(cover);

          const title = document.createElement("h2");
          title.className = "title";
          title.textContent = item.title;
          itemDiv.appendChild(title);

          const company = document.createElement("span");
          company.className = "company";
          company.textContent = item.company;
          itemDiv.appendChild(company);

          const platforms = document.createElement("p");
          platforms.className = "platforms";
          platforms.textContent = `${item.platforms.join("、")}`;
          itemDiv.appendChild(platforms);

          const downloads = document.createElement("p");
          downloads.className = "downloads";
          item.downloads.forEach((download) => {
            const button = document.createElement("button");
            button.className = "download-button";
            button.textContent = `${download.provider}`;
            button.onclick = () => window.open(download.url, "_blank");
            downloads.appendChild(button);
          });
          itemDiv.appendChild(downloads);

          const author = document.createElement("span");
          author.className = "author";
          author.textContent = `编辑者：${item.author}`;
          itemDiv.appendChild(author);

          contentDiv.appendChild(itemDiv);
        });
      })
      .catch((error) => {
        console.error("获取数据失败:", error);
        document.getElementById("content").textContent =
          "加载数据失败，请稍后重试。";
      });
  }
}

// 排行榜功能
function initRankPage() {
  if (!document.querySelector(".content.rank")) {
    return;
  }

  let currentType = "views";
  let currentDays = 30;

  const rankContent = document.getElementById("rank-content");
  const daysSelect = document.getElementById("days-select");
  const tabs = document.querySelectorAll(".rank-tab");

  // 切换标签
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentType = tab.dataset.type;
      fetchRankData();
    });
  });

  // 切换时间范围
  if (daysSelect) {
    daysSelect.addEventListener("change", () => {
      currentDays = parseInt(daysSelect.value);
      fetchRankData();
    });
  }

  // 获取排行榜数据
  function fetchRankData() {
    rankContent.innerHTML =
      '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';

    const apiUrl = `https://rp.30hb.cn/?target=https://inarigal.com/api/ranking/${currentType}?days=${currentDays}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("网络响应失败");
        }
        return response.json();
      })
      .then((result) => {
        if (result.success && result.data) {
          renderRankList(result.data);
        } else {
          throw new Error("数据格式错误");
        }
      })
      .catch((error) => {
        console.error("获取排行榜数据失败:", error);
        rankContent.innerHTML =
          '<div class="error"><i class="fas fa-exclamation-circle"></i> 加载数据失败，请稍后重试</div>';
      });
  }

  // 渲染排行榜列表
  function renderRankList(data) {
    if (!data || data.length === 0) {
      rankContent.innerHTML =
        '<div class="no-data"><i class="fas fa-inbox"></i><p>暂无排行数据</p></div>';
      return;
    }

    const listDiv = document.createElement("div");
    listDiv.className = "rank-list";

    data.forEach((item, index) => {
      const rank = index + 1;
      const itemDiv = document.createElement("div");
      itemDiv.className = `rank-item ${rank <= 3 ? `top-${rank}` : ""}`;

      // 创建头部容器（用于移动端布局）
      const headerDiv = document.createElement("div");
      headerDiv.className = "rank-header";

      // 排名
      const rankNumber = document.createElement("div");
      rankNumber.className = "rank-number";
      if (rank === 1) {
        rankNumber.innerHTML = '<i class="fas fa-crown"></i>';
      } else if (rank === 2) {
        rankNumber.innerHTML = '<i class="fas fa-medal"></i>';
      } else if (rank === 3) {
        rankNumber.innerHTML = '<i class="fas fa-award"></i>';
      } else {
        rankNumber.textContent = rank;
      }
      headerDiv.appendChild(rankNumber);

      // 封面
      if (item.cover_url) {
        const cover = document.createElement("img");
        cover.className = "rank-cover";
        cover.src = item.cover_url;
        cover.alt = item.title_cn || item.title_jp || "封面";
        cover.loading = "lazy";
        headerDiv.appendChild(cover);
      }

      // 信息
      const infoDiv = document.createElement("div");
      infoDiv.className = "rank-info";

      const titleLink = document.createElement("a");
      titleLink.className = "rank-title";

      // 优先显示中文标题，如果没有则显示日文
      const displayTitle = item.title_cn || item.title_jp || "未知标题";
      titleLink.textContent = displayTitle;

      // 如果有vndb_id，生成VNDB链接
      if (item.vndb_id) {
        titleLink.href = `https://vndb.org/${item.vndb_id}`;
        titleLink.target = "_blank";
        titleLink.rel = "noopener noreferrer";
      } else {
        titleLink.style.cursor = "default";
        titleLink.style.textDecoration = "none";
      }
      infoDiv.appendChild(titleLink);

      const metaDiv = document.createElement("div");
      metaDiv.className = "rank-meta";

      // 如果有日文标题且不同于中文标题，显示日文标题
      if (item.title_jp && item.title_jp !== item.title_cn) {
        const jpTitle = document.createElement("span");
        jpTitle.className = "meta-item";
        jpTitle.innerHTML = `<i class="fas fa-language"></i> ${item.title_jp}`;
        metaDiv.appendChild(jpTitle);
      }

      // 开发商
      if (item.developer_name) {
        const developer = document.createElement("span");
        developer.className = "meta-item";
        developer.innerHTML = `<i class="fas fa-building"></i> ${item.developer_name}`;
        metaDiv.appendChild(developer);
      }

      // VNDB ID
      if (item.vndb_id) {
        const vndbId = document.createElement("span");
        vndbId.className = "meta-item";
        vndbId.innerHTML = `<i class="fas fa-database"></i> ${item.vndb_id}`;
        metaDiv.appendChild(vndbId);
      }

      infoDiv.appendChild(metaDiv);
      headerDiv.appendChild(infoDiv);

      itemDiv.appendChild(headerDiv);

      // 数值
      const valueDiv = document.createElement("div");
      valueDiv.className = "rank-value";

      const valueNumber = document.createElement("div");
      valueNumber.className = "value-number";

      // 根据类型获取相应的数值
      const value =
        currentType === "views"
          ? parseInt(item.scan_count) || 0
          : parseInt(item.download_count) || 0;

      valueNumber.textContent = formatNumber(value);
      valueDiv.appendChild(valueNumber);

      const valueLabel = document.createElement("div");
      valueLabel.className = "value-label";
      valueLabel.textContent = currentType === "views" ? "浏览" : "下载";
      valueDiv.appendChild(valueLabel);

      itemDiv.appendChild(valueDiv);
      listDiv.appendChild(itemDiv);
    });

    rankContent.innerHTML = "";
    rankContent.appendChild(listDiv);
  }

  // 格式化数字
  function formatNumber(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }

  // 初始加载
  fetchRankData();
}

// ==========================================
// AI 感想生成功能
// ==========================================

/**
 * 初始化 AI 感想功能
 */
function initAIReview() {
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
        "Authorization": `Bearer ${API_KEY}`,
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
      throw new Error(
        "无法连接到 AI 服务，请检查网络连接"
      );
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
