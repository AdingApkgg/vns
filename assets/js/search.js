// 站点搜索与导航助手：search / 随机跳转 / 快捷键 / 18+ 验证
// 依赖外部全局：PagefindUI / swup / Swal / window.localStorage

export function initSearch() {
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
      setTimeout(function () {
        var searchInput = searchContainer.querySelector(
          ".pagefind-ui__search-input",
        );
        if (searchInput) {
          searchInput.value = query;
          // 触发 input 事件让 PagefindUI 执行搜索
          searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, 100);
    }
  }
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
