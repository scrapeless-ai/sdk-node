# Scrapeless Node SDK

[![npm version](https://badge.fury.io/js/@scrapeless-ai%2Fsdk.svg)](https://badge.fury.io/js/@scrapeless-ai%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**[English](README.md) | [中文文档](README-zh.md)**

[Scrapeless AI](https://scrapeless.com) 官方 Node.js SDK - 一个强大的网页抓取和浏览器自动化平台，帮助您大规模提取任何网站的数据。

## 📑 目录

- [🌟 特性](#-特性)
- [📦 安装](#-安装)
- [🚀 快速开始](#-快速开始)
- [📖 使用示例](#-使用示例)
- [🔧 API 参考](#-api-参考)
- [📚 示例](#-示例)
- [🧪 测试](#-测试)
- [🛠️ 贡献&开发指南](#️-贡献开发指南)
- [📄 许可证](#-许可证)
- [📞 支持](#-支持)
- [🏢 关于 Scrapeless](#-关于-scrapeless)

## 🌟 特性

- **浏览器自动化**：支持 Playwright 和 Puppeteer 的远程浏览器会话
- **网页抓取**：通过智能解析从任何网站提取数据
- **SERP 抓取**：高精度提取搜索引擎结果
- **代理管理**：内置代理轮换和地理定位
- **Actor 系统**：在云端运行自定义自动化脚本
- **存储解决方案**：为您的抓取项目提供持久化数据存储
- **TypeScript 支持**：完整的 TypeScript 类型定义，提供更好的开发体验

## 📦 安装

使用 npm 安装 SDK：

```bash
npm install @scrapeless-ai/sdk
```

或使用 yarn：

```bash
yarn add @scrapeless-ai/sdk
```

或使用 pnpm：

```bash
pnpm add @scrapeless-ai/sdk
```

## 🚀 快速开始

### 基本设置

```javascript
import { Scrapeless } from '@scrapeless-ai/sdk';

// 初始化客户端
const client = new Scrapeless({
  apiKey: 'your-api-key' // 从 https://scrapeless.com 获取您的 API 密钥
});
```

### 环境变量

您也可以使用环境变量配置 SDK：

```bash
# 必需
SCRAPELESS_API_KEY=your-api-key

# 可选 - 自定义 API 端点
SCRAPELESS_BASE_API_URL=https://api.scrapeless.com
SCRAPELESS_ACTOR_API_URL=https://actor.scrapeless.com
SCRAPELESS_STORAGE_API_URL=https://storage.scrapeless.com
SCRAPELESS_BROWSER_API_URL=https://browser.scrapeless.com
SCRAPELESS_CRAWL_API_URL=https://crawl.scrapeless.com
```

## 📖 使用示例

### 浏览器自动化

创建远程浏览器会话并使用 Puppeteer 或 Playwright 控制：

```javascript
import { Scrapeless } from '@scrapeless-ai/sdk';
import puppeteer from 'puppeteer-core';

const client = new Scrapeless();

// 创建浏览器会话
const { browserWSEndpoint } = await client.browser.create({
  session_name: 'my-session',
  session_ttl: 180,
  proxy_country: 'US'
});

// 使用 Puppeteer 连接
const browser = await puppeteer.connect({
  browserWSEndpoint: browserWSEndpoint
});

const page = await browser.newPage();
await page.goto('https://example.com');
console.log(await page.title());

await browser.close();
```

### 网页抓取

通过智能解析从网站提取数据：

```javascript
const result = await client.scraping.scrape({
  actor: 'scraper.google.search',
  input: {
    q: 'nike site:www.nike.com'
  }
});

console.log(result.data);
```

### SERP 抓取

提取搜索引擎结果：

```javascript
const results = await client.deepserp.scrape({
  actor: 'scraper.google.search',
  input: {
    q: 'nike site:www.nike.com'
  }
});

console.log(results);
```

### Actor 系统

在云端运行自定义自动化脚本：

```javascript
// 运行 actor
const run = await client.actor.run(actor.id, {
  input: { url: "https://example.com" },
  runOptions: {
    CPU: 2;
    memory: 2048;
    timeout: 3600;
    version: 'v1.0.0';
  }
});

console.log("Actor 运行结果:", run);
```

## 🔧 API 参考

### 客户端配置

```typescript
interface ScrapelessConfig {
  apiKey?: string; // 您的 API 密钥
  timeout?: number; // 请求超时时间（毫秒，默认：30000）
  baseApiUrl?: string; // 基础 API URL
  actorApiUrl?: string; // Actor 服务 URL
  storageApiUrl?: string; // 存储服务 URL
  browserApiUrl?: string; // 浏览器服务 URL
  scrapingCrawlApiUrl?: string; // 爬取服务 URL
}
```

### 可用服务

SDK 通过主客户端提供以下服务：

- `client.browser` - 浏览器会话管理
- `client.scraping` - 网页抓取和数据提取
- `client.deepserp` - 搜索引擎结果提取
- `client.universal` - 通用数据提取
- `client.proxies` - 代理管理
- `client.actor` - 自定义自动化的 Actor 系统
- `client.storage` - 数据存储解决方案
- `client.scrapingCrawl` - 网站爬取

### 错误处理

SDK 对于 API 相关错误会抛出 `ScrapelessError`：

```javascript
import { ScrapelessError } from '@scrapeless-ai/sdk';

try {
  const result = await client.scraping.scrape({ url: 'invalid-url' });
} catch (error) {
  if (error instanceof ScrapelessError) {
    console.error(`Scrapeless API 错误: ${error.message}`);
    console.error(`状态码: ${error.statusCode}`);
  }
}
```

## 📚 示例

查看 [`examples`](./examples) 目录获取完整的使用示例：

- [浏览器自动化](./examples/browser-example.js)
- [Playwright 集成](./examples/playwright-example.js)
- [Puppeteer 集成](./examples/puppeteer-example.js)
- [网页抓取](./examples/scraping-example.js)
- [Actor 系统](./examples/actor-example.js)
- [存储使用](./examples/storage-example.js)
- [代理管理](./examples/proxies-example.js)
- [SERP 抓取](./examples/deepserp-example.js)

## 🧪 测试

运行测试套件：

```bash
npm test
```

SDK 包含所有服务和工具的全面测试。

## 🛠️ 贡献&开发指南

欢迎所有形式的贡献！关于如何提交 issue、PR、代码规范、本地开发等详细内容，请参见[贡献与开发指南](./CONTRIBUTING-zh.md)。

**快速开始：**

```bash
git clone https://github.com/scrapeless-ai/scrapeless-sdk-node.git
cd scrapeless-sdk-node
pnpm install
pnpm test
pnpm lint
pnpm format
```

更多项目结构、最佳实践等内容请参见 [CONTRIBUTING-zh.md](./CONTRIBUTING-zh.md)。

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

- 📖 **文档**: [https://docs.scrapeless.com](https://docs.scrapeless.com)
- 💬 **社区**: [加入我们的 Discord](https://backend.scrapeless.com/app/api/v1/public/links/discord)
- 🐛 **问题**: [GitHub Issues](https://github.com/scrapeless-ai/scrapeless-sdk-node/issues)
- 📧 **邮箱**: [support@scrapeless.com](mailto:support@scrapeless.com)

## 🏢 关于 Scrapeless

Scrapeless 是一个强大的网页抓取和浏览器自动化平台，帮助企业大规模从任何网站提取数据。我们的平台提供：

- 高性能网页抓取基础设施
- 全球代理网络
- 浏览器自动化功能
- 企业级可靠性和支持

访问 [scrapeless.com](https://scrapeless.com) 了解更多并开始使用。

---

由 Scrapeless 团队用 ❤️ 制作
