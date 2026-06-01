// 媒体相关：鼠标 firework / lozad lazy 加载 / medium-zoom 图片缩放
// 依赖外部全局：firework（mouse-firework UMD）、lozad（UMD）、mediumZoom（UMD）

export function mouseFirework() {
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

export function initLozad() {
  const el = document.querySelectorAll("img");
  const observerLozad = lozad(el);
  observerLozad.observe();
}

/**
 * 初始化 medium-zoom 图片缩放
 */
export function initMediumZoom() {
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
