# Scrapeless Node SDK

[![npm version](https://badge.fury.io/js/@scrapeless-ai%2Fsdk.svg)](https://badge.fury.io/js/@scrapeless-ai%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**[English](README.md) | [中文文档](README-zh.md)**

The official Node.js SDK for [Scrapeless AI](https://scrapeless.com) - a powerful web scraping and browser automation platform that helps you extract data from any website at scale.

## 📑 Table of Contents

- [🌟 Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Examples](#-usage-examples)
- [🔧 API Reference](#-api-reference)
- [📚 Examples](#-examples)
- [🧪 Testing](#-testing)
- [🛠️ Contributing & Development Guide](#️-contributing--development-guide)
- [📄 License](#-license)
- [📞 Support](#-support)
- [🏢 About Scrapeless](#-about-scrapeless)

## 🌟 Features

- **Browser Automation**: Remote browser sessions with Playwright and Puppeteer support
- **Web Scraping**: Extract data from any website with intelligent parsing
- **SERP Scraping**: Extract search engine results with high accuracy
- **Proxy Management**: Built-in proxy rotation and geo-targeting
- **Actor System**: Run custom automation scripts in the cloud
- **Storage Solutions**: Persistent data storage for your scraping projects
- **TypeScript Support**: Full TypeScript definitions for better development experience

## 📦 Installation

Install the SDK using npm:

```bash
npm install @scrapeless-ai/sdk
```

Or using yarn:

```bash
yarn add @scrapeless-ai/sdk
```

Or using pnpm:

```bash
pnpm add @scrapeless-ai/sdk
```

## 🚀 Quick Start

### Prerequisite

[Log in](https://app.dashboard.scrapeless.com) to the Scrapeless Dashboard and get the API Key

### Basic Setup

```javascript
import { Scrapeless } from '@scrapeless-ai/sdk';

// Initialize the client
const client = new Scrapeless({
  apiKey: 'your-api-key' // Get your API key from https://scrapeless.com
});
```

### Environment Variables

You can also configure the SDK using environment variables:

```bash
# Required
SCRAPELESS_API_KEY=your-api-key

# Optional - Custom API endpoints
SCRAPELESS_BASE_API_URL=https://api.scrapeless.com
SCRAPELESS_ACTOR_API_URL=https://actor.scrapeless.com
SCRAPELESS_STORAGE_API_URL=https://storage.scrapeless.com
SCRAPELESS_BROWSER_API_URL=https://browser.scrapeless.com
SCRAPELESS_CRAWL_API_URL=https://crawl.scrapeless.com
```

## 📖 Usage Examples

### Browser Automation

Create remote browser sessions and control them with Puppeteer or Playwright:

```javascript
import { Scrapeless } from '@scrapeless-ai/sdk';
import puppeteer from 'puppeteer-core';

const client = new Scrapeless();

// Create a browser session
const { browserWSEndpoint } = await client.browser.create({
  session_name: 'my-session',
  session_ttl: 180,
  proxy_country: 'US'
});

// Connect with Puppeteer
const browser = await puppeteer.connect({
  browserWSEndpoint: browserWSEndpoint
});

const page = await browser.newPage();
await page.goto('https://example.com');
console.log(await page.title());

await browser.close();
```

### Web Scraping

Extract data from websites with intelligent parsing:

```javascript
const result = await client.scraping.scrape({
  actor: 'scraper.google.search',
  input: {
    q: 'nike site:www.nike.com'
  }
});

console.log(result.data);
```

### SERP Scraping

Extract search engine results:

```javascript
const results = await client.deepserp.scrape({
  actor: 'scraper.google.search',
  input: {
    q: 'nike site:www.nike.com'
  }
});

console.log(results);
```

### Actor System

Run custom automation scripts in the cloud:

```javascript
// Run an actor
const run = await client.actor.run(actor.id, {
  input: { url: 'https://example.com' },
  runOptions: {
    CPU: 2,
    memory: 2048,
    timeout: 3600,
    version: 'v1.0.0'
  }
});

console.log('Actor run result:', run);
```

## 🔧 API Reference

### Client Configuration

```typescript
interface ScrapelessConfig {
  apiKey?: string; // Your API key
  timeout?: number; // Request timeout in milliseconds (default: 30000)
  baseApiUrl?: string; // Base API URL
  actorApiUrl?: string; // Actor service URL
  storageApiUrl?: string; // Storage service URL
  browserApiUrl?: string; // Browser service URL
  scrapingCrawlApiUrl?: string; // Crawl service URL
}
```

### Available Services

The SDK provides the following services through the main client:

- `client.browser` - Browser session management
- `client.scraping` - Web scraping and data extraction
- `client.deepserp` - Search engine results extraction
- `client.universal` - Universal data extraction
- `client.proxies` - Proxy management
- `client.actor` - Actor system for custom automation
- `client.storage` - Data storage solutions
- `client.scrapingCrawl` - Website crawling

### Error Handling

The SDK throws `ScrapelessError` for API-related errors:

```javascript
import { ScrapelessError } from '@scrapeless-ai/sdk';

try {
  const result = await client.scraping.scrape({ url: 'invalid-url' });
} catch (error) {
  if (error instanceof ScrapelessError) {
    console.error(`Scrapeless API Error: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
  }
}
```

## 📚 Examples

Check out the [`examples`](./examples) directory for comprehensive usage examples:

- [Browser Automation](./examples/browser-example.js)
- [Playwright Integration](./examples/playwright-example.js)
- [Puppeteer Integration](./examples/puppeteer-example.js)
- [Web Scraping](./examples/scraping-example.js)
- [Actor System](./examples/actor-example.js)
- [Storage Usage](./examples/storage-example.js)
- [Proxy Management](./examples/proxies-example.js)
- [SERP Scraping](./examples/deepserp-example.js)

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The SDK includes comprehensive tests for all services and utilities.

## 🛠️ Contributing & Development Guide

We welcome all contributions! For details on how to report issues, submit pull requests, follow code style, and set up local development, please see our [Contributing & Development Guide](./CONTRIBUTING.md).

**Quick Start:**

```bash
git clone https://github.com/scrapeless-ai/scrapeless-sdk-node.git
cd scrapeless-sdk-node
pnpm install
pnpm test
pnpm lint
pnpm format
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full details on contribution process, development workflow, code quality, project structure, best practices, and more.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📖 **Documentation**: [https://docs.scrapeless.com](https://docs.scrapeless.com)
- 💬 **Community**: [Join our Discord](https://backend.scrapeless.com/app/api/v1/public/links/discord)
- 🐛 **Issues**: [GitHub Issues](https://github.com/scrapeless-ai/scrapeless-sdk-node/issues)
- 📧 **Email**: [support@scrapeless.com](mailto:support@scrapeless.com)

## 🏢 About Scrapeless

Scrapeless is a powerful web scraping and browser automation platform that helps businesses extract data from any website at scale. Our platform provides:

- High-performance web scraping infrastructure
- Global proxy network
- Browser automation capabilities
- Enterprise-grade reliability and support

Visit [scrapeless.com](https://scrapeless.com) to learn more and get started.

---

Made with ❤️ by the Scrapeless team
