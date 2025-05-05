(() => {
  // <stdin>
  document.addEventListener("DOMContentLoaded", () => {
    initGalPopup();
    lunar();
    initDarkMode();
    initScrollEffects();
    initMediumZoom();
  });
  document.addEventListener("pjax:complete", () => {
    quicklink.listen({ priority: true });
    initGalPopup();
    lunar();
    initDarkMode();
    initScrollEffects();
    initMediumZoom();
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
  function initMediumZoom() {
    mediumZoom(".zoomable", {
      margin: 0,
      background: "transparent",
      scrollOffset: 20
    });
  }
  function initGalPopup() {
    const tAgeVerification = document.getElementById("tAgeVerification");
    if (!tAgeVerification) {
      console.error("Age verification translations not found");
      return;
    }
    const text = tAgeVerification.dataset.text || "\u672C\u30B5\u30A4\u30C8\u306F18\u6B73\u4EE5\u4E0A\u306E\u65B9\u3092\u5BFE\u8C61\u3068\u3057\u3066\u3044\u307E\u3059\u3002<br>\u3042\u306A\u305F\u306F18\u6B73\u4EE5\u4E0A\u3067\u3059\u304B\uFF1F";
    const yes = tAgeVerification.dataset.yes || "\u306F\u3044";
    const no = tAgeVerification.dataset.no || "\u3044\u3044\u3048";
    const locationHref = tAgeVerification.dataset.url;
    const ageVerificationTime = localStorage.getItem("ageVerificationTime");
    const oneWeek = 3 * 24 * 60 * 60 * 1e3;
    const now = (/* @__PURE__ */ new Date()).getTime();
    if (!ageVerificationTime || now - parseInt(ageVerificationTime) > oneWeek) {
      Swal.fire({
        text,
        icon: "warning",
        showConfirmButton: true,
        confirmButtonText: yes,
        showDenyButton: true,
        denyButtonText: no,
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        color: "var(--text-color)",
        background: "var(--bg-color)"
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem("ageVerificationTime", now.toString());
        } else {
          window.location.href = locationHref;
        }
      });
    }
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
  function lunar() {
    var lunarInfo = [
      19416,
      19168,
      42352,
      21717,
      53856,
      55632,
      91476,
      22176,
      39632,
      21970,
      19168,
      42422,
      42192,
      53840,
      119381,
      46400,
      54944,
      44450,
      38320,
      84343,
      18800,
      42160,
      46261,
      27216,
      27968,
      109396,
      11104,
      38256,
      21234,
      18800,
      25958,
      54432,
      59984,
      28309,
      23248,
      11104,
      100067,
      37600,
      116951,
      51536,
      54432,
      120998,
      46416,
      22176,
      107956,
      9680,
      37584,
      53938,
      43344,
      46423,
      27808,
      46416,
      86869,
      19872,
      42416,
      83315,
      21168,
      43432,
      59728,
      27296,
      44710,
      43856,
      19296,
      43748,
      42352,
      21088,
      62051,
      55632,
      23383,
      22176,
      38608,
      19925,
      19152,
      42192,
      54484,
      53840,
      54616,
      46400,
      46752,
      103846,
      38320,
      18864,
      43380,
      42160,
      45690,
      27216,
      27968,
      44870,
      43872,
      38256,
      19189,
      18800,
      25776,
      29859,
      59984,
      27480,
      23232,
      43872,
      38613,
      37600,
      51552,
      55636,
      54432,
      55888,
      30034,
      22176,
      43959,
      9680,
      37584,
      51893,
      43344,
      46240,
      47780,
      44368,
      21977,
      19360,
      42416,
      86390,
      21168,
      43312,
      31060,
      27296,
      44368,
      23378,
      19296,
      42726,
      42208,
      53856,
      60005,
      54576,
      23200,
      30371,
      38608,
      19195,
      19152,
      42192,
      118966,
      53840,
      54560,
      56645,
      46496,
      22224,
      21938,
      18864,
      42359,
      42160,
      43600,
      111189,
      27936,
      44448,
      84835,
      37744,
      18936,
      18800,
      25776,
      92326,
      59984,
      27424,
      108228,
      43744,
      41696,
      53987,
      51552,
      54615,
      54432,
      55888,
      23893,
      22176,
      42704,
      21972,
      21200,
      43448,
      43344,
      46240,
      46758,
      44368,
      21920,
      43940,
      42416,
      21168,
      45683,
      26928,
      29495,
      27296,
      44368,
      84821,
      19296,
      42352,
      21732,
      53600,
      59752,
      54560,
      55968,
      92838,
      22224,
      19168,
      43476,
      41680,
      53584,
      62034,
      54560
    ], solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Gan = ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"], Zhi = [
      "\u5B50",
      "\u4E11",
      "\u5BC5",
      "\u536F",
      "\u8FB0",
      "\u5DF3",
      "\u5348",
      "\u672A",
      "\u7533",
      "\u9149",
      "\u620C",
      "\u4EA5"
    ], Animals = [
      "\u9F20",
      "\u725B",
      "\u864E",
      "\u5154",
      "\u9F99",
      "\u86C7",
      "\u9A6C",
      "\u7F8A",
      "\u7334",
      "\u9E21",
      "\u72D7",
      "\u732A"
    ], solarTerm = [
      "\u5C0F\u5BD2",
      "\u5927\u5BD2",
      "\u7ACB\u6625",
      "\u96E8\u6C34",
      "\u60CA\u86F0",
      "\u6625\u5206",
      "\u6E05\u660E",
      "\u8C37\u96E8",
      "\u7ACB\u590F",
      "\u5C0F\u6EE1",
      "\u8292\u79CD",
      "\u590F\u81F3",
      "\u5C0F\u6691",
      "\u5927\u6691",
      "\u7ACB\u79CB",
      "\u5904\u6691",
      "\u767D\u9732",
      "\u79CB\u5206",
      "\u5BD2\u9732",
      "\u971C\u964D",
      "\u7ACB\u51AC",
      "\u5C0F\u96EA",
      "\u5927\u96EA",
      "\u51AC\u81F3"
    ], sTermInfo = [
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
      "7f0e27f1487f531b0b0bb0b6fb0722"
    ], nStr1 = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341"], nStr2 = ["\u521D", "\u5341", "\u5EFF", "\u5345"], nStr3 = [
      "\u6B63",
      "\u4E8C",
      "\u4E09",
      "\u56DB",
      "\u4E94",
      "\u516D",
      "\u4E03",
      "\u516B",
      "\u4E5D",
      "\u5341",
      "\u51AC",
      "\u814A"
    ];
    function lYearDays(b) {
      var f, c = 348;
      for (f = 32768; f > 8; f >>= 1) c += lunarInfo[b - 1900] & f ? 1 : 0;
      return c + leapDays(b);
    }
    function leapMonth(b) {
      return 15 & lunarInfo[b - 1900];
    }
    function leapDays(b) {
      return leapMonth(b) ? 65536 & lunarInfo[b - 1900] ? 30 : 29 : 0;
    }
    function monthDays(b, f) {
      return f > 12 || f < 1 ? -1 : lunarInfo[b - 1900] & 65536 >> f ? 30 : 29;
    }
    function solarDays(b, f) {
      if (f > 12 || f < 1) return -1;
      var c = f - 1;
      return 1 === c ? b % 4 == 0 && b % 100 != 0 || b % 400 == 0 ? 29 : 28 : solarMonth[c];
    }
    function toGanZhiYear(b) {
      var f = (b - 3) % 10, c = (b - 3) % 12;
      return 0 === f && (f = 10), 0 === c && (c = 12), Gan[f - 1] + Zhi[c - 1];
    }
    function toAstro(b, f) {
      return "\u9B54\u7FAF\u6C34\u74F6\u53CC\u9C7C\u767D\u7F8A\u91D1\u725B\u53CC\u5B50\u5DE8\u87F9\u72EE\u5B50\u5904\u5973\u5929\u79E4\u5929\u874E\u5C04\u624B\u9B54\u7FAF".substr(
        2 * b - (f < [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22][b - 1] ? 2 : 0),
        2
      ) + "\u5EA7";
    }
    function toGanZhi(b) {
      return Gan[b % 10] + Zhi[b % 12];
    }
    function getTerm(b, f) {
      if (b < 1900 || b > 2100) return -1;
      if (f < 1 || f > 24) return -1;
      var c = sTermInfo[b - 1900], e = [
        parseInt("0x" + c.substr(0, 5)).toString(),
        parseInt("0x" + c.substr(5, 5)).toString(),
        parseInt("0x" + c.substr(10, 5)).toString(),
        parseInt("0x" + c.substr(15, 5)).toString(),
        parseInt("0x" + c.substr(20, 5)).toString(),
        parseInt("0x" + c.substr(25, 5)).toString()
      ], a = [
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
        e[5].substr(4, 2)
      ];
      return parseInt(a[f - 1]);
    }
    function toChinaMonth(b) {
      if (b > 12 || b < 1) return -1;
      var f = nStr3[b - 1];
      return f += "\u6708";
    }
    function toChinaDay(b) {
      var f;
      switch (b) {
        case 10:
          f = "\u521D\u5341";
          break;
        case 20:
          f = "\u4E8C\u5341";
          break;
        case 30:
          f = "\u4E09\u5341";
          break;
        default:
          f = nStr2[Math.floor(b / 10)], f += nStr1[b % 10];
      }
      return f;
    }
    function getAnimal(b) {
      return Animals[(b - 4) % 12];
    }
    function solar2lunar(b, f, c) {
      if (b < 1900 || b > 2100) return -1;
      if (1900 === b && 1 === f && c < 31) return -1;
      var e, a, r = null, t = 0;
      b = (r = b ? new Date(b, parseInt(f) - 1, c) : /* @__PURE__ */ new Date()).getFullYear(), f = r.getMonth() + 1, c = r.getDate();
      var d2 = (Date.UTC(r.getFullYear(), r.getMonth(), r.getDate()) - Date.UTC(1900, 0, 31)) / 864e5;
      for (e = 1900; e < 2101 && d2 > 0; e++) d2 -= t = lYearDays(e);
      d2 < 0 && (d2 += t, e--);
      var n = /* @__PURE__ */ new Date(), s = false;
      n.getFullYear() === b && n.getMonth() + 1 === f && n.getDate() === c && (s = true);
      var u = r.getDay(), o = nStr1[u];
      0 === u && (u = 7);
      var l2 = e;
      a = leapMonth(e);
      var i = false;
      for (e = 1; e < 13 && d2 > 0; e++)
        a > 0 && e === a + 1 && false === i ? (--e, i = true, t = leapDays(l2)) : t = monthDays(l2, e), true === i && e === a + 1 && (i = false), d2 -= t;
      0 === d2 && a > 0 && e === a + 1 && (i ? i = false : (i = true, --e)), d2 < 0 && (d2 += t, --e);
      var h = e, D = d2 + 1, g = f - 1, v = toGanZhiYear(l2), y2 = getTerm(b, 2 * f - 1), m2 = getTerm(b, 2 * f), p = toGanZhi(12 * (b - 1900) + f + 11);
      c >= y2 && (p = toGanZhi(12 * (b - 1900) + f + 12));
      var M = false, T = null;
      y2 === c && (M = true, T = solarTerm[2 * f - 2]), m2 === c && (M = true, T = solarTerm[2 * f - 1]);
      var I = toGanZhi(Date.UTC(b, g, 1, 0, 0, 0, 0) / 864e5 + 25567 + 10 + c - 1), C = toAstro(f, c);
      return {
        lYear: l2,
        lMonth: h,
        lDay: D,
        Animal: getAnimal(l2),
        IMonthCn: (i ? "\u95F0" : "") + toChinaMonth(h),
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
        ncWeek: "\u661F\u671F" + o,
        isTerm: M,
        Term: T,
        astro: C
      };
    }
    var calendarFormatter = {
      solar2lunar: function(b, f, c) {
        return solar2lunar(b, f, c);
      },
      lunar2solar: function(b, f, c, e) {
        if ((e = !!e) && leapMonth !== f) return -1;
        if (2100 === b && 12 === f && c > 1 || 1900 === b && 1 === f && c < 31)
          return -1;
        var a = monthDays(b, f), r = a;
        if (e && (r = leapDays(b, f)), b < 1900 || b > 2100 || c > r) return -1;
        for (var t = 0, d2 = 1900; d2 < b; d2++) t += lYearDays(d2);
        var n = 0, s = false;
        for (d2 = 1; d2 < f; d2++)
          n = leapMonth(b), s || n <= d2 && n > 0 && (t += leapDays(b), s = true), t += monthDays(b, d2);
        e && (t += a);
        var u = Date.UTC(1900, 1, 30, 0, 0, 0), o = new Date(864e5 * (t + c - 31) + u);
        return solar2lunar(o.getUTCFullYear(), o.getUTCMonth() + 1, o.getUTCDate());
      }
    };
    var d = /* @__PURE__ */ new Date();
    m = d.getMonth() + 1;
    dd = d.getDate();
    y = d.getFullYear();
    if (m == 9 && dd == 18) {
      document.getElementsByTagName("html")[0].setAttribute("style", "filter: grayscale(60%);");
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(
          "\u4ECA\u5929\u662F\u4E5D\u4E00\u516B\u4E8B\u53D8" + (y - 1931).toString() + "\u5468\u5E74\u7EAA\u5FF5\u65E5\n\u{1FA94}\u52FF\u5FD8\u56FD\u803B\uFF0C\u632F\u5174\u4E2D\u534E\u{1FA94}"
        );
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 7 && dd == 7) {
      document.getElementsByTagName("html")[0].setAttribute("style", "filter: grayscale(60%);");
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(
          "\u4ECA\u5929\u662F\u5362\u6C9F\u6865\u4E8B\u53D8" + (y - 1937).toString() + "\u5468\u5E74\u7EAA\u5FF5\u65E5\n\u{1FA94}\u52FF\u5FD8\u56FD\u803B\uFF0C\u632F\u5174\u4E2D\u534E\u{1FA94}"
        );
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 12 && dd == 13) {
      document.getElementsByTagName("html")[0].setAttribute("style", "filter: grayscale(60%);");
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(
          "\u4ECA\u5929\u662F\u5357\u4EAC\u5927\u5C60\u6740" + (y - 1937).toString() + "\u5468\u5E74\u7EAA\u5FF5\u65E5\n\u{1FA94}\u52FF\u5FD8\u56FD\u803B\uFF0C\u632F\u5174\u4E2D\u534E\u{1FA94}"
        );
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 8 && dd == 14) {
      document.getElementsByTagName("html")[0].setAttribute("style", "filter: grayscale(60%);");
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u4ECA\u5929\u662F\u4E16\u754C\u6170\u5B89\u5987\u7EAA\u5FF5\u65E5\n\u{1FA94}\u52FF\u5FD8\u56FD\u803B\uFF0C\u632F\u5174\u4E2D\u534E\u{1FA94}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 10 && dd <= 3) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u795D\u7956\u56FD" + (y - 1949).toString() + "\u5C81\u751F\u65E5\u5FEB\u4E50\uFF01");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 8 && dd == 15) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u5C0F\u65E5\u5B50\u5DF2\u7ECF\u6295\u964D" + (y - 1945).toString() + "\u5E74\u4E86\u{1F603}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 1 && dd == 1) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(y.toString() + "\u5E74\u5143\u65E6\u5FEB\u4E50\uFF01\u{1F389}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 3 && dd == 8) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u5404\u4F4D\u5973\u795E\u4EEC\uFF0C\u5987\u5973\u8282\u5FEB\u4E50\uFF01\u{1F469}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    l = [
      "\u975E\u5E38\u62B1\u6B49\uFF0C\u56E0\u4E3A\u4E0D\u53EF\u63A7\u539F\u56E0\uFF0C\u535A\u5BA2\u5C06\u4E8E\u660E\u5929\u505C\u6B62\u8FD0\u8425\uFF01",
      "\u597D\u6D88\u606F\uFF0C\u65E5\u672C\u6CA1\u4E86\uFF01",
      "\u7F8E\u56FD\u57AE\u4E86\uFF0C\u539F\u56E0\u7ADF\u7136\u662F\u5DDD\u666E\uFF01",
      "\u5FAE\u8F6F\u57AE\u4E86\uFF01",
      "\u4F60\u7684\u7535\u8111\u5DF2\u7ECF\u8FC7\u8F7D\uFF0C\u5EFA\u8BAE\u7ACB\u5373\u5173\u673A\uFF01",
      "\u4F60\u77E5\u9053\u5417\uFF1F\u7AD9\u957F\u5F88\u559C\u6B22\u4F60\u54E6\uFF01",
      "\u4E00\u5206\u949F\u670961\u79D2\u54E6",
      "\u4F60\u559C\u6B22\u7684\u4EBA\u8DDF\u522B\u4EBA\u8DD1\u4E86\uFF01"
    ];
    if (m == 4 && dd == 1) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(l[Math.floor(Math.random() * l.length)]);
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 5 && dd == 1) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u52B3\u52A8\u8282\u5FEB\u4E50\n\u4E3A\u5404\u884C\u5404\u4E1A\u8F9B\u52E4\u5DE5\u4F5C\u7684\u4EBA\u4EEC\u81F4\u656C\uFF01");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 5 && dd == 4) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u9752\u5E74\u8282\u5FEB\u4E50\n\u9752\u6625\u4E0D\u662F\u56DE\u5FC6\u901D\u53BB,\u800C\u662F\u628A\u63E1\u73B0\u5728\uFF01");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 5 && dd == 20) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u4ECA\u5E74\u662F520\u60C5\u4EBA\u8282\n\u5FEB\u548C\u4F60\u559C\u6B22\u7684\u4EBA\u4E00\u8D77\u8FC7\u5427\uFF01\u{1F491}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 7 && dd == 1) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u795D\u4E2D\u56FD\u5171\u4EA7\u515A" + (y - 1921).toString() + "\u5C81\u751F\u65E5\u5FEB\u4E50\uFF01");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 9 && dd == 10) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u5404\u4F4D\u8001\u5E08\u4EEC\u6559\u5E08\u8282\u5FEB\u4E50\uFF01\u{1F469}\u200D\u{1F3EB}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (m == 12 && dd == 25) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u5723\u8BDE\u8282\u5FEB\u4E50\uFF01\u{1F384}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (y == 2023 && m == 4 && dd == 5 || y == 2024 && m == 4 && dd == 4 || y == 2025 && m == 4 && dd == 4) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u6E05\u660E\u65F6\u8282\u96E8\u7EB7\u7EB7,\u4E00\u675F\u9C9C\u82B1\u796D\u6545\u4EBA\u{1F490}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (y == 2023 && m == 12 && dd == 22 || y == 2024 && m == 12 && dd == 21 || y == 2025 && m == 12 && dd == 21) {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u51AC\u81F3\u5FEB\u4E50\n\u5FEB\u5403\u4E0A\u4E00\u7897\u70ED\u70ED\u7684\u6C64\u5706\u548C\u997A\u5B50\u5427\u{1F9C6}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    var lunar2 = calendarFormatter.solar2lunar();
    if (lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u516D" || lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u4E94" || lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u56DB" || lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u4E09" || lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u4E8C" || lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u521D\u4E00" || lunar2["IMonthCn"] == "\u814A\u6708" && lunar2["IDayCn"] == "\u4E09\u5341" || lunar2["IMonthCn"] == "\u814A\u6708" && lunar2["IDayCn"] == "\u5EFF\u4E5D") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire(y.toString() + "\u5E74\u65B0\u5E74\u5FEB\u4E50\n\u{1F38A}\u795D\u4F60\u5FC3\u60F3\u4E8B\u6210\uFF0C\u8BF8\u4E8B\u987A\u5229\u{1F38A}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (lunar2["IMonthCn"] == "\u6B63\u6708" && lunar2["IDayCn"] == "\u5341\u4E94") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u5143\u5BB5\u8282\u5FEB\u4E50\n\u9001\u4F60\u4E00\u4E2A\u5927\u5927\u7684\u706F\u7B3C\u{1F9C5}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (lunar2["IMonthCn"] == "\u4E94\u6708" && lunar2["IDayCn"] == "\u521D\u4E94") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u7AEF\u5348\u8282\u5FEB\u4E50\n\u8BF7\u4F60\u5403\u4E00\u6761\u7CBD\u5B50\u{1F359}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (lunar2["IMonthCn"] == "\u4E03\u6708" && lunar2["IDayCn"] == "\u521D\u4E03") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u4E03\u5915\u8282\u5FEB\u4E50\n\u9EC4\u660F\u540E,\u67F3\u68A2\u5934,\u725B\u90CE\u7EC7\u5973\u6765\u78B0\u5934");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (lunar2["IMonthCn"] == "\u516B\u6708" && lunar2["IDayCn"] == "\u5341\u4E94") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u4E2D\u79CB\u8282\u5FEB\u4E50\n\u8BF7\u4F60\u5403\u4E00\u5757\u6708\u997C\u{1F36A}");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
    if (lunar2["IMonthCn"] == "\u4E5D\u6708" && lunar2["IDayCn"] == "\u521D\u4E5D") {
      if (sessionStorage.getItem("isPopupWindow") != "1") {
        Swal.fire("\u91CD\u9633\u8282\u5FEB\u4E50\n\u72EC\u5728\u5F02\u4E61\u4E3A\u5F02\u5BA2\uFF0C\u6BCF\u9022\u4F73\u8282\u500D\u601D\u4EB2");
        sessionStorage.setItem("isPopupWindow", "1");
      }
    }
  }
})();
