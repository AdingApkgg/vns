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
