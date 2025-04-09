---
title: 环境搭建
date: 2025-04-01T19:39:32+08:00
author: molin
---

⚙ 本节介绍 Galgame 的**下载->运行**环节所需环境的搭建，包括驱动程序、运行库、软件。

<!--more-->

> Galgame 的主要平台是桌面 PC Windows 系统，因此本节以 Windows 10/11 为例。移动端平台参见[安卓模拟器](/docs/%E5%90%84%E7%A7%8D%E6%A8%A1%E6%8B%9F%E5%99%A8%E4%BB%8B%E7%BB%8D/)。至于桌面 MacOS、Linux 与主机平台（PS、NS、Xbox），不建议考虑，前者上手复杂，后者存在**游戏数量少**、**内容限制**、**汉化支持不足**等问题。

## 下载

通过本站分流链接打开资源页面后，建议先阅读下文再开始下载。

游戏的下载方式主要有以下几种：

1. **直链**：通过链接直接从网站获取资源。
2. **磁力链接/Torrent 种子**：使用 Torrent 客户端加载 `.torrent` 文件或 `magnet:?xt=urn:btih:` 链接下载资源。
3. **云盘**：互联网厂商提供的存储服务。

优先选择直链或磁力链接/Torrent 种子。国内云盘常见限速、内容审核封禁、隐私等问题，本节不作介绍。

### 下载工具

以下推荐一些提升下载速度的软件，请根据支持的下载方式按需选择：

1. **Internet Download Manager (IDM)**
   [IDM](https://www.internetdownloadmanager.com/) 支持**直链**，可集成主流浏览器。付费软件，提供 30 天免费试用。官网点击 Download，按提示安装即可。

2. **qBittorrent**
   免费的 BitTorrent 客户端，支持**Torrent 种子、磁力链接**。推荐安装 [qBittorrent Enhanced Edition](https://github.com/c0re100/qBittorrent-Enhanced-Edition/releases)。
   > 建议搭配 [trackerslist](https://trackerslist.com/) 使用。

## 解压

游戏文件通常以压缩包形式分发，后缀名通常为 RAR、ZIP、7z。需使用解压软件解压后才能使用。以下介绍常见解压软件：

> 解压过程中可能出现密码提示，请检查资源网站的公告文档获取密码。

### 1. 文件资源管理器（File Explorer）内置解压缩

Windows 系统从 XP 开始集成 ZIP 支持，可通过右键菜单直接解压 ZIP 格式压缩包，无需额外软件。

### 2. 7-Zip

[7-Zip](https://sparanoid.com/lab/7z/)：免费，支持 ZIP、CAB、RAR、gzip、bzip2 等格式。

### 3. WinRAR

[WinRAR](https://www.winrar.com.cn/)：有非商业个人免费版，支持 RAR、ZIP、TAR，GZ、ISO、7z 等格式。

> WinRAR、7-Zip 可集成到右键菜单，可在软件设置中更改此行为（可能需要管理员权限）。

## 运行

Windows 10/11 运行 Galgame 通常开箱即用。若遇启动失败、运行异常等情况，请按以下步骤逐步排查。

### 1. 系统驱动/运行库安装

> 满足以下情况之一时，才需安装驱动程序或运行库：
> 1. 运行游戏程序失败，提示缺少 dll 文件等问题。
> 2. 画面异常。

**Visual C++ Redistributable**
[Visual C++ Redistributable](https://learn.microsoft.com/zh-cn/cpp/windows/latest-supported-vc-redist?view=msvc-170)：安装 2013、2015~2022 版本运行库，基本解决大部分问题。

**DirectX**
[DirectX® End-User Runtime](http://www.microsoft.com/zh-cn/download/details.aspx?id=35&751be11f-ede8-5a0c-058c-2ee190a24fa6=True)：DirectX 最终用户运行时 Web 安装程序。

**Microsoft .NET Framework**
[Microsoft .NET Framework](https://dotnet.microsoft.com/zh-cn/download/dotnet-framework)：下载。

**更新/安装显卡驱动程序**
参考显卡驱动官网，确保驱动程序保持最新。

### 2. 语言环境设置

日本 Galgame 存在**区域限制**。若系统区域或语言非日本地区或日语，游戏可能无法运行，表现为**弹窗/标题乱码、无法启动**。

**解决方案**：

使用 [Locale Emulator](https://github.com/xupefei/Locale-Emulator) 转区工具：右键游戏主程序，选择“Locale-Emulator → Run in Japanese（日语环境）”，无需修改系统区域设置。

> 转区针对日文原版启动程序，民间汉化版本不需要。汉化补丁一般以 *_cn.exe 表现。

### 3. 文件路径检查

**游戏路径确认**
建议游戏路径保持纯英文、无特殊字符，否则可能出现运行无响应、弹窗 `无法打开` 等问题。

**系统用户名确认**
建议用户名设置为英文。部分游戏存档存放在用户资料夹下，如 `C:\Users\用户名\Documents`。若路径包含中文可能导致存档存取失败。

### 4. 杀毒软件管理

杀毒软件通常进行磁盘实时扫描、文件隔离等操作，可能误删游戏文件，导致无法启动等问题。以下以 Windows 系统预装杀毒软件 **Defender Control** 为例。

> 360 卫士、腾讯管家、火绒等其他杀毒软件请自行搜索教程。
> 此类情况常发生于游戏解压时，误删文件以汉化补丁程序居多。

**添加排除项**：

打开[安全中心](ms-settings:windowsdefender)，点击 -> 病毒和威胁防护 -> 病毒和威胁防护的管理设置 -> 排除项 -> 添加或删除排除项，点击添加排除项。建议用文件夹方式将游戏父目录添加上去。

![添加排除项](/img/1744214511.avif)
