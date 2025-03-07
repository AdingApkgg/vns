document.addEventListener("DOMContentLoaded", function () {
  // Initialize Pjax
  var pjax = new Pjax({
    selectors: ["title", "main"],
    cacheBust: false,
  });

  // Handle Pjax events
  document.addEventListener("pjax:complete", function () {
    // Reinitialize any scripts or styles after Pjax load
  });
});

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

const text = pangu.spacing("當你凝視著bug，bug也凝視著你");
// text = '當你凝視著 bug，bug 也凝視著你'

pangu.spacingElementById("main");
pangu.spacingElementByClassName("comment");
pangu.spacingElementByTagName("p");

document.addEventListener("DOMContentLoaded", () => {
  // listen to any DOM change and automatically perform spacing via MutationObserver()
  pangu.autoSpacingPage();
});
