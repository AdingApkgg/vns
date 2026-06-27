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

// 评论区改用 Basecoat tabs 负责切换（aria + 键盘）。这里只保留 Artalk 的懒加载：
// 监听 #panel-artalk 的 hidden 属性，面板首次显示时再 init（无论点击还是键盘触发）。
function initCommentTabs() {
  var panel = document.getElementById("panel-artalk");
  if (!panel) return;

  // 翻页（swup）到新页面时销毁旧实例，避免指向已替换的 DOM
  if (artalkInstance) {
    artalkInstance.destroy();
    artalkInstance = null;
  }

  if (panel._artalkObserved) {
    if (!panel.hidden && !artalkInstance) initArtalk();
    return;
  }
  var obs = new MutationObserver(function () {
    if (!panel.hidden && !artalkInstance) initArtalk();
  });
  obs.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  panel._artalkObserved = true;

  // 若该面板初始即可见（非默认），立即加载
  if (!panel.hidden && !artalkInstance) initArtalk();
}

window.initCommentTabs = initCommentTabs;
