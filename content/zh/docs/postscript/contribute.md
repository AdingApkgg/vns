# 贡献指南

>  
>
> 介绍如何为本项目贡献代码

## 起步

### 0. 阅读贡献者公约

:smile: 参与贡献之前，我们希望您先阅读[贡献者公约](/code_of_conduct.md)，这有助于您了解贡献者应当遵循的基本规则。

### 1. 派生Fork仓库

**确保选择正确的分支**

| 分支     | 说明     |
| --- | --- |
| main    |  Hexo构建，主站点   |
| dev     |  Hugo构建，新站点   |

### 2. 克隆仓库到本地

### 3. 编辑文档

确认负责的区域,如'posts/docs'。

### 4. 推送至派生仓库

提交信息并未明确规范，但是请尽量遵守约定式提交，详情参阅[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)


### 5. 提交合并请求Pull request

## 目录结构说明

```
./
├── content/                 # 主要代码，支持中日英
│   ├── en/
│   ├── ja/
│   └── zh/
│       ├── docs/            # 教程文档
│       └── posts/           # 游戏文章
│       
├── static/                  # 静态资源（图片、音频等）
│   ├── audio/
│   │   └── 1742721919.mp3
│   ├── img/
│   │   ├── 1742721344.avif
│   └── video/
│       └── 1742721919.webm
├── themes/                 # 主题
├── code_of_conduct.md      # 贡献者公约
├── hugo.toml               # 项目依赖
├── LICENSE
└── README.md               # 项目自述


```

## 格式说明

文档编写以Markdown格式为主，以Markdown格式为例，基本语法参照[官网](https://markdown.com.cn/basic-syntax/)，其他的文档格式请参阅[Hugo](https://gohugo.io/content-management/formats/)官网。

### Front Matter
```md
---
title: 社团名称/中文译名/原名/英文译名(可选)
tags: []
categories: []
date: yyyy-MM-dd HH:mm:ss
author: 
---
```

### 正文大纲

基本脉络如下，若有其他内容可自行添加。

1. 封面
2. 作品概述
3. 剧情简介
4. 外部链接
5. 提示备注
6. 引流


## 文件上传

### 文件命名

图片、音频等静态资源应以**Unix时间戳**命名，可用[在线工具](https://tool.chinaz.com/tools/unixtime.aspx)。

文件格式首推**高质量压缩**的，具体格式如下，制作与转换可用在线工具[ImagesTool](https://imagestool.com/zh_CN/)。

| 图片   | 音频  | 视频  |
| ---- | --- | ------- |
| avif、webp | mp3 | webm|





    

    










