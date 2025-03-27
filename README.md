# Visual Novel Site

<p class="badges">
  <a
    href="https://github.com/AdingApkgg/vns"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      alt="GitHub last commit"
      src="https://img.shields.io/github/last-commit/AdingApkgg/vns"
    />
  </a>
<a
    href="https://github.com/AdingApkgg/vns"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      alt="GitHub Repo stars"
      src="https://img.shields.io/github/stars/AdingApkgg/vns?style=social"
    />
  </a>
  <a
    href="https://github.com/AdingApkgg/vns/blob/main/LICENSE"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      alt="GitHub"
      src="https://img.shields.io/github/license/AdingApkgg/vns"
    >
  </a>

</p>

<p align="center">
中文&emsp;|&emsp;<a href="./README_en.md">English</a>
</p>


---

> [站点地址](https://gal.saop.cc/)
>
> Galgame数据库

- Hugo框架驱动,性能强劲
- 支持中日英三种语言
- 目前网站有许多内容需要建设完善，参阅贡献章节帮助完善

## 本地运行

> 搭建开发环境需要安装Git、Hugo等工具

### Winget

```sh
winget install Microsoft.Git
winget install Hugo.Hugo.Extended
git clone -b dev https://github.com/AdingApkgg/vns.git
cd ./vns
hugo server -D
```

### Homebrew

```sh
brew install hugo
git clone -b dev https://github.com/AdingApkgg/vns.git
cd vns && hugo server -D
```

### Pacman 

```sh
sudo pacman -S hugo
git clone -b dev https://github.com/AdingApkgg/vns.git
cd vns && hugo server -D

```
其他环境请参阅[HuGo官方文档](https://gohugo.io)。

## 参与贡献

欢迎对本站内容及源码做贡献，更多信息请参阅[贡献指南](/content/zh/docs/postscript/contribute.md)。

## 版权说明

网站源代码采用MIT许可证，更多信息请参阅[版权说明](./LICENSE)

## 贡献者

<a href="https://github.com/AdingApkgg/vns/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AdingApkgg/vns" alt="contributors"/>
</a>

