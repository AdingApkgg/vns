(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    initDarkMode();
    initScrollEffects();
    mediumZoom(".zoomable");
  });
  document.addEventListener("pjax:complete", () => {
    quicklink.listen({ priority: true });
    initDarkMode();
    initScrollEffects();
    mediumZoom(".zoomable");
  });
  function initDarkMode() {
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
      });
    }
  }
  function initScrollEffects() {
    const header = document.querySelector("header");
    const backToTopButton = document.getElementById("back-to-top");
    if (!header || !backToTopButton) return;
    window.addEventListener("scroll", function() {
      if (window.scrollY > 200) {
        header.classList.add("fixed");
      } else {
        header.classList.remove("fixed");
      }
      if (window.scrollY > 300) {
        backToTopButton.style.display = "block";
        backToTopButton.classList.add("show");
      } else {
        backToTopButton.style.display = "none";
        backToTopButton.classList.remove("show");
      }
    });
    backToTopButton.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
  if (window.localStorage.getItem("fpson") == void 0 || window.localStorage.getItem("fpson") == "1") {
    rAF = function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1e3 / 60);
      };
    }();
    frame = 0;
    allFrameCount = 0;
    lastTime = Date.now();
    lastFameTime = Date.now();
    loop = function() {
      var now = Date.now();
      var fs = now - lastFameTime;
      var fps = Math.round(1e3 / fs);
      lastFameTime = now;
      allFrameCount++;
      frame++;
      if (now > 1e3 + lastTime) {
        var fps = Math.round(frame * 1e3 / (now - lastTime));
        if (fps <= 5) {
          var kd = `<span style="color:#bd0000">\u5361\u6210ppt\u{1F922}</span>`;
        } else if (fps <= 15) {
          var kd = `<span style="color:red">\u7535\u7ADE\u7EA7\u5E27\u7387\u{1F616}</span>`;
        } else if (fps <= 25) {
          var kd = `<span style="color:orange">\u6709\u70B9\u96BE\u53D7\u{1F628}</span>`;
        } else if (fps < 35) {
          var kd = `<span style="color:#9338e6">\u4E0D\u592A\u6D41\u7545\u{1F644}</span>`;
        } else if (fps <= 45) {
          var kd = `<span style="color:#08b7e4">\u8FD8\u4E0D\u9519\u54E6\u{1F601}</span>`;
        } else {
          var kd = `<span style="color:#39c5bb">\u5341\u5206\u6D41\u7545\u{1F923}</span>`;
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
  var rAF;
  var frame;
  var allFrameCount;
  var lastTime;
  var lastFameTime;
  var loop;
  var observer = new MutationObserver(function(mutations) {
    const lrcButton = document.querySelector(".aplayer-icon-lrc");
    if (lrcButton) {
      setTimeout(function() {
        lrcButton.click();
      }, 1);
      observer.disconnect();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
})();
