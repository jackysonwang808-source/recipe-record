# 收据扫描APP部署指南

## 概述

本指南将帮助您将收据扫描APP部署到互联网上，使其可以通过网址直接访问和搜索。

## 部署方案

### 方案一：使用 GitHub Pages（免费）

**步骤：**

1. 在 GitHub 创建一个新仓库
2. 将项目文件（index.html, style.css, script.js）上传到仓库
3. 进入仓库设置 → Pages
4. 选择分支为 `main`，目录为 `/`
5. 点击 "Save"，等待几分钟后即可通过 `https://yourusername.github.io/repo-name/` 访问

### 方案二：使用 Vercel（免费，推荐）

**步骤：**

1. 访问 https://vercel.com/ 并注册账号
2. 点击 "New Project"，选择导入您的 GitHub 仓库
3. Vercel 会自动检测项目类型并配置部署
4. 部署完成后会获得一个域名，如 `https://receipt-scanner.vercel.app`

### 方案三：使用 Netlify（免费）

**步骤：**

1. 访问 https://www.netlify.com/ 并注册账号
2. 点击 "New site from Git"，连接您的 GitHub 仓库
3. 构建命令留空，发布目录填 `/`
4. 点击 "Deploy"，等待部署完成

### 方案四：传统虚拟主机

**步骤：**

1. 购买虚拟主机（如阿里云、腾讯云、GoDaddy等）
2. 通过 FTP 或文件管理器上传项目文件到主机根目录
3. 配置域名解析指向主机IP
4. 通过您的域名访问

## 自定义域名配置

### 购买域名

推荐购买渠道：
- 阿里云：https://wanwang.aliyun.com/
- 腾讯云：https://dnspod.cloud.tencent.com/
- GoDaddy：https://www.godaddy.com/

### 配置域名解析

以阿里云为例：

1. 进入域名管理控制台
2. 添加 DNS 记录：
   - 类型：A 记录
   - 主机记录：@（或 www）
   - 记录值：您的服务器IP地址

### 在 Vercel/Netlify 配置自定义域名

1. 在部署平台的项目设置中找到 "Domains"
2. 添加您的自定义域名
3. 根据提示配置 DNS 记录（通常是 CNAME 记录）

## 搜索引擎优化（SEO）

为了让您的网站更容易被搜索到，请修改以下内容：

### 更新 index.html 中的 meta 标签

```html
<meta name="description" content="收据扫描助手 - 使用手机摄像头读取收据数据，自动识别并导出Excel文件">
<meta name="keywords" content="收据扫描, OCR识别, Excel导出, 收据管理, 电子发票">
<meta name="author" content="您的名字">
```

### 添加结构化数据

在 index.html 的 `<head>` 中添加：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "收据扫描助手",
  "description": "使用手机摄像头扫描收据，自动识别数据并导出Excel",
  "url": "https://yourdomain.com"
}
</script>
```

## HTTPS 配置

大多数托管平台（Vercel、Netlify、GitHub Pages）会自动提供 HTTPS。如果使用传统主机，请：

1. 在 Let's Encrypt 申请免费 SSL 证书
2. 在主机控制面板中配置 SSL

## 部署检查清单

- [ ] 上传所有文件（index.html, style.css, script.js）
- [ ] 配置域名解析
- [ ] 启用 HTTPS
- [ ] 更新页面标题和 meta 标签
- [ ] 测试摄像头功能是否正常
- [ ] 测试 OCR 识别功能
- [ ] 测试 Excel 导出功能

## 常见问题

### Q: 摄像头无法使用？

A: 确保网站使用 HTTPS 协议，浏览器需要安全连接才能访问摄像头。

### Q: OCR 识别速度慢？

A: Tesseract.js 需要下载语言包，首次使用可能较慢。可以考虑使用云OCR服务。

### Q: 如何升级为云OCR服务？

A: 可以集成百度OCR、腾讯OCR或阿里云OCR，提供更准确的识别效果。

## 联系方式

如有部署问题，请参考各平台官方文档或联系您的主机提供商。