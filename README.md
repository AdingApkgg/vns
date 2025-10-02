# Visual Novel Site

- 由 [Go](https://go.dev/) && [Hugo](https://gohugo.io/) 强力驱动~

## 本地运行

> 搭建开发环境需要安装 [Git](https://git-scm.com/)、[Hugo](https://gohugo.io/)、[Sass](https://sass-lang.com/)、[Node.js](https://nodejs.org/zh-cn)、[Pagefind](https://pagefind.app/) 等工具..

### Windows => Winget

```sh
winget install Git.Git Hugo.Hugo.Extended OpenJS.NodeJS
choco install sass
npm install -g pagefind
git clone https://github.com/AdingApkgg/vns.git && cd vns
hugo && pagefind
hugo server
```

### macOS => Homebrew

```sh
brew install git hugo sass/sass/sass node
npm install -g pagefind
git clone https://github.com/AdingApkgg/vns.git && cd vns
hugo && pagefind
hugo server
```

### Arch Linux => Pacman

```sh
pacman -S git hugo dart-sass nodejs
npm install -g pagefind
git clone https://github.com/AdingApkgg/vns.git && cd vns
hugo && pagefind
hugo server
```

更多内容请参阅 [Hugo](https://gohugo.io/)..

## 参与贡献

目前网站有许多内容需要建设完善，欢迎对本站内容及源码做贡献，更多信息请参阅 [贡献指南](https://vns.saop.cc/docs/%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97/)。
