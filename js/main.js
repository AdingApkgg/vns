const jsonUrl = "https://ghfast.top/https://raw.githubusercontent.com/AdingApkgg/vns/data/data.json";

fetch(jsonUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("网络响应失败");
        }
        return response.json();
    })
    .then((data) => {
        const contentDiv = document.getElementById("content");
        data.forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";

            const title = document.createElement("h2");
            title.className = "title";
            title.textContent = item.title;
            itemDiv.appendChild(title);

            const company = document.createElement("p");
            company.className = "company";
            company.textContent = item.company;
            itemDiv.appendChild(company);

            const cover = document.createElement("img");
            cover.className = "cover";
            cover.src = item.cover;
            cover.alt = item.title;
            itemDiv.appendChild(cover);

            const description = document.createElement("p");
            description.className = "description";
            description.textContent = item.description;
            itemDiv.appendChild(description);

            const tags = document.createElement("p");
            tags.className = "tags";
            tags.textContent = `标签：${item.tags.join("、")}`;
            itemDiv.appendChild(tags);

            const platforms = document.createElement("p");
            platforms.className = "platforms";
            platforms.textContent = `平台：${item.platforms.join("、")}`;
            itemDiv.appendChild(platforms);

            const downloads = document.createElement("p");
            downloads.className = "downloads";
            downloads.textContent = "分流：";

            item.downloads.forEach((download) => {
                const button = document.createElement("button");
                button.className = "download-button";
                button.textContent = `${download.provider}`;
                button.onclick = () => window.open(download.url, "_blank");
                downloads.appendChild(button);
            });

            itemDiv.appendChild(downloads);
            contentDiv.appendChild(itemDiv);
        });
    })
    .catch((error) => {
        console.error("获取数据失败:", error);
        document.getElementById("content").textContent =
            "加载数据失败，请稍后重试。";
    });