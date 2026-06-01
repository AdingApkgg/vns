// 页面专用功能：文章 TOC / 投稿表单 / Valine 评论 / 下载页 DLS / 排行榜
// 依赖外部全局：AV（leancloud）、Valine、Swal

export function initTOCSidebar() {
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
      ":scope > ul > li.has-children, :scope > ol > li.has-children",
    );
    if (firstLevel) {
      firstLevel.classList.add("open");
    }
  }
}

export function initPostSubmissionForm() {
  const form = document.getElementById("resource-submit-form");
  const tip = document.getElementById("post-submit-tip");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";
  const resourceList = document.getElementById("post-resource-list");
  const addResourceBtn = document.getElementById("post-add-resource");

  const setTip = (message, type) => {
    if (!tip) return;
    tip.textContent = message || "";
    tip.classList.remove("is-error", "is-success");
    if (type) tip.classList.add(type);
  };

  const splitList = (value) =>
    (value || "")
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const buildDownloadItems = (resources) =>
    resources.map((item, idx) => {
      const passText = item.password ? `，密码：\`${item.password}\`` : "";
      return `${idx + 1}. ${item.site} & \`${item.platform}\`：[点击下载](${item.url})${passText}`;
    });

  const createResourceRow = () => {
    const row = document.createElement("div");
    row.className = "post-submit__resource-item";
    row.innerHTML = `
      <input type="text" name="resourceSite" placeholder="站点名（如：TouchGAL）" />
      <input type="text" name="resourcePlatform" placeholder="平台（如：Windows / ONS）" />
      <input type="url" name="resourceUrl" placeholder="下载链接（https://...）" />
      <input type="text" name="resourcePassword" placeholder="密码（选填）" />
      <button type="button" class="post-submit__remove-row" aria-label="删除这一条">删除</button>
    `;
    bindRemoveAction(row);
    return row;
  };

  const clearResourceRow = (row) => {
    row.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
  };

  const bindRemoveAction = (row) => {
    const removeBtn = row.querySelector(".post-submit__remove-row");
    if (!removeBtn || removeBtn.dataset.bound === "1") return;
    removeBtn.dataset.bound = "1";
    removeBtn.addEventListener("click", () => {
      if (!resourceList) return;
      const rows = resourceList.querySelectorAll(".post-submit__resource-item");
      if (rows.length <= 1) {
        clearResourceRow(row);
        return;
      }
      row.remove();
    });
  };

  const collectResources = () => {
    if (!resourceList) return [];
    const rows = Array.from(
      resourceList.querySelectorAll(".post-submit__resource-item"),
    );
    return rows
      .map((row) => ({
        site: row.querySelector('[name="resourceSite"]')?.value.trim() || "",
        platform:
          row.querySelector('[name="resourcePlatform"]')?.value.trim() || "",
        url: row.querySelector('[name="resourceUrl"]')?.value.trim() || "",
        password:
          row.querySelector('[name="resourcePassword"]')?.value.trim() || "",
      }))
      .filter(
        (item) => item.site || item.platform || item.url || item.password,
      );
  };

  if (resourceList) {
    resourceList
      .querySelectorAll(".post-submit__resource-item")
      .forEach((row) => bindRemoveAction(row));
  }

  if (addResourceBtn && resourceList) {
    addResourceBtn.addEventListener("click", () => {
      const row = createResourceRow();
      resourceList.appendChild(row);
      const firstInput = row.querySelector('[name="resourceSite"]');
      if (firstInput) firstInput.focus();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = form.postTitle?.value.trim() || "";
    const categories = splitList(form.categories?.value.trim() || "");
    const nickname = form.nickname?.value.trim() || "";
    const content = form.content?.value.trim() || "";
    const contact = form.contact?.value.trim() || "";
    const resources = collectResources();
    const validResources = resources.filter(
      (item) => item.site && item.platform && item.url,
    );

    if (
      !title ||
      categories.length === 0 ||
      !nickname ||
      validResources.length === 0
    ) {
      setTip(
        "请先填写必填项：作品名称、分类、投稿人昵称、至少一条完整分流。",
        "is-error",
      );
      return;
    }

    const bodyLines = [
      "资源投稿信息如下：",
      "",
      `作品名称：${title}`,
      `分类：${categories.join(" / ")}`,
      `投稿人昵称：${nickname}`,
      `投稿人联系方式：${contact || "未填写"}`,
      "",
      "## 分流",
      "",
      ...buildDownloadItems(validResources),
      "",
      "## 投稿补充",
      "",
      content || "无",
    ];

    const subject = `资源投稿《${title}》`;
    const body = bodyLines.join("\n");

    const mailto = `mailto:i@saop.cc?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTip("正在拉起邮箱客户端...", "is-success");
    window.location.href = mailto;
  });
}


// Valine 配置 + 表情映射 + 初始化防抖定时器
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
    "OK",
    "aini",
    "aixin",
    "aoman",
    "baiyan",
    "bangbangtang",
    "baojin",
    "baoquan",
    "bishi",
    "bizui",
    "cahan",
    "caidao",
    "chi",
    "ciya",
    "dabing",
    "daku",
    "dan",
    "deyi",
    "doge",
    "fadai",
    "fanu",
    "fendou",
    "ganga",
    "gouyin",
    "guzhang",
    "haixiu",
    "hanxiao",
    "haobang",
    "haqian",
    "hecai",
    "hexie",
    "huaixiao",
    "jie",
    "jingkong",
    "jingxi",
    "jingya",
    "juhua",
    "keai",
    "kelian",
    "koubi",
    "ku",
    "kuaikule",
    "kulou",
    "kun",
    "lanqiu",
    "leiben",
    "lenghan",
    "liuhan",
    "liulei",
    "nanguo",
    "penxue",
    "piezui",
    "pijiu",
    "qiang",
    "qiaoda",
    "qinqin",
    "qiudale",
    "quantou",
    "saorao",
    "se",
    "shengli",
    "shouqiang",
    "shuai",
    "shui",
    "tiaopi",
    "touxiao",
    "tu",
    "tuosai",
    "weiqu",
    "weixiao",
    "woshou",
    "wozuimei",
    "wunai",
    "xia",
    "xiaojiujie",
    "xiaoku",
    "xiaoyanger",
    "xieyanxiao",
    "xigua",
    "xu",
    "yangtuo",
    "yinxian",
    "yiwen",
    "youhengheng",
    "youling",
    "yun",
    "zaijian",
    "zhayanjian",
    "zhemo",
    "zhouma",
    "zhuakuang",
    "zuohengheng",
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
      maps[`贴吧新表情-image_emoticon${i}`] =
        `Tieba-New/image_emoticon${i}.png`;
    }
  });

  return maps;
})();


// Valine 初始化防抖定时器
let valineInitTimer = null;

export function initValine() {
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

export function fetchDLS() {
  if (document.querySelector(".content.dls")) {
    const jsonUrl =
      "https://ghfast.top/https://raw.githubusercontent.com/AdingApkgg/vns/refs/heads/main/data/dls.json";

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

export function initRankPage() {
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
