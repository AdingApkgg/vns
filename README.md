# Visual Novel Site

[简体中文](README.zh.md) | [日本語](README.ja.md) | [English](README.md)

***

- Powered by the [Hugo](https://gohugo.io/) framework
- Supports internationalization and multilingual features

## Local Development

> Setting up the development environment requires tools like [Git](https://git-scm.com/) and [Hugo](https://gohugo.io/).

### Windows => Winget

```sh
winget install Hugo.Hugo.Extended
git clone -b dev https://github.com/AdingApkgg/vns.git && cd vns
git submodule update --init
hugo server --gc -D
```

### macOS => Homebrew

```sh
brew install hugo
git clone -b dev https://github.com/AdingApkgg/vns.git && cd vns
git submodule update --init
hugo server --gc -D
```

### Arch Linux => Pacman

```sh
pacman -S hugo
git clone -b dev https://github.com/AdingApkgg/vns.git && cd vns
git submodule update --init
hugo server --gc -D
```

For more details, please refer to [Hugo](https://gohugo.io/).

## Contributing

The site still has many areas that need improvement. Contributions to both the content and source code are welcome. For more information, please refer to the [Contribution Guide](/content/en/docs/postscript/contribute.md).
