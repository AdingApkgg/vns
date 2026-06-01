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

export function displayResults(results) {
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


export function highlightText(text, query) {
  return text.replace(
    new RegExp(query, "gi"),
    (match) => `<span class="highlight">${match}</span>`,
  );
}
