var artalkInstance = null;

function initArtalk() {
  var el = document.getElementById("artalk-comments");
  if (!el || typeof Artalk === "undefined") return;

  if (artalkInstance) {
    artalkInstance.destroy();
    artalkInstance = null;
  }

  el.innerHTML = "";
  artalkInstance = Artalk.init({
    el: "#artalk-comments",
    server: "https://artalk.saop.cc",
    site: "VNS",
    darkMode: 'auto',
  });
}

function initCommentTabs() {
  var tabs = document.querySelectorAll(".comment-tab");
  if (!tabs.length) return;

  artalkInstance = null;

  tabs.forEach(function (tab) {
    if (tab._tabBound) return;
    tab.addEventListener("click", function () {
      var target = this.dataset.tab;
      document.querySelectorAll(".comment-tab").forEach(function (t) {
        t.classList.toggle("active", t.dataset.tab === target);
      });
      document.querySelectorAll(".comment-panel").forEach(function (p) {
        p.classList.toggle("active", p.id === "panel-" + target);
      });
      if (target === "artalk" && !artalkInstance) {
        initArtalk();
      }
    });
    tab._tabBound = true;
  });
}

window.initCommentTabs = initCommentTabs;
