const pjax = new Pjax({
  selectors: ["header", "main"],
  cacheBust: false,
});

document.addEventListener("pjax:complete", function () {
  if (typeof initDarkMode === "function") initDarkMode();
  if (typeof initCodeHighlight === "function") initCodeHighlight();
});

window.onload = function () {
  Fancybox.bind('[data-fancybox="gallery"]', {});
  pangu.spacingElementById("main");
  pangu.spacingElementByClassName("comment");
  pangu.spacingElementByTagName("p");
  document.addEventListener("DOMContentLoaded", () => {
    pangu.autoSpacingPage();
  });
};
Fancybox.fromSelector('[data-fancybox="gallery"]');

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

function initDarkMode() {
  const themeToggle = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }
}
document.addEventListener("DOMContentLoaded", initDarkMode);

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

var meting_api =
  "https://meting.qjqq.cn/?server=:server&type=:type&id=:id&auth=:auth&r=:r";
