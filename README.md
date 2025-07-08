# Scrapeless Node SDK

[![npm version](https://badge.fury.io/js/@scrapeless-ai%2Fsdk.svg)](https://badge.fury.io/js/@scrapeless-ai%2Fsdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The official Node.js SDK for [Scrapeless AI](https://scrapeless.com) - End-to-End Data Infrastructure for AI Developers & Enterprises.

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

- **Browser**: Advanced browser session management supporting Playwright and Puppeteer frameworks, with configurable anti-detection capabilities (e.g., fingerprint spoofing, CAPTCHA solving) and extensible automation workflows.
- **Universal Scraping API**: web interaction and data extraction with full browser capabilities. Execute JavaScript rendering, simulate user interactions (clicks, scrolls), bypass anti-scraping measures, and export structured data in formats.
- **Crawl**: Extract data from single pages or traverse entire domains, exporting in formats including Markdown, JSON, HTML, screenshots, and links.
- **Scraping API**: Direct data extraction APIs for websites (e.g., e-commerce, travel platforms). Retrieve structured product information, pricing, and reviews with pre-built connectors.
- **Deep SerpApi**: Google SERP data extraction API. Fetch organic results, news, images, and more with customizable parameters and real-time updates.
- **Proxies**: Geo-targeted proxy network with 195+ countries. Optimize requests for better success rates and regional data access.
- **Actor**: Deploy custom crawling and data processing workflows at scale with built-in scheduling and resource management.
- **Storage Solutions**: Scalable data storage solutions for crawled content, supporting seamless integration with cloud services and databases.
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

[Log in](https://app.scrapeless.com) to the Scrapeless Dashboard and get the API Key

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
SCRAPELESS_CRAWL_API_URL=https://api.scrapeless.com
```

## 📖 Usage Examples

### Browser

Advanced browser session management supporting Playwright and Puppeteer frameworks, with configurable anti-detection capabilities (e.g., fingerprint spoofing, CAPTCHA solving) and extensible automation workflows:

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

### Crawl

Extract data from single pages or traverse entire domains, exporting in formats including Markdown, JSON, HTML, screenshots, and links.

```javascript
const result = await client.scrapingCrawl.scrapeUrl('https://example.com');

console.log(result);
```

### Scraping API

Direct data extraction APIs for websites (e.g., e-commerce, travel platforms). Retrieve structured product information, pricing, and reviews with pre-built connectors:

```javascript
const result = await client.scraping.scrape({
  actor: 'scraper.shopee',
  input: {
    url: 'https://shopee.tw/a-i.10228173.24803858474'
  }
});

console.log(result.data);
```

### Deep SerpApi

Google SERP data extraction API. Fetch organic results, news, images, and more with customizable parameters and real-time updates:

```javascript
const results = await client.deepserp.scrape({
  actor: 'scraper.google.search',
  input: {
    q: 'nike site:www.nike.com'
  }
});

console.log(results);
```

### Actor

Deploy custom crawling and data processing workflows at scale with built-in scheduling and resource management:

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

- `client.browser` - browser automation with Playwright/Puppeteer support, anti-detection tools (fingerprinting, CAPTCHA solving), and extensible workflows.
- `client.universal` - JS rendering, user simulation (clicks/scrolls), anti-block bypass, and structured data export.
- `client.scrapingCrawl` - Recursive site crawling with multi-format export (Markdown, JSON, HTML, screenshots, links).
- `client.scraping` - Pre-built connectors for sites (e.g., e-commerce, travel) to extract product data, pricing, and reviews.
- `client.deepserp` - Search engine results extraction
- `client.proxies` - Proxy management
- `client.actor` - Scalable workflow automation with built-in scheduling and resource management.
- `client.storage` - Data storage solutions

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

- [Browser](./examples/browser-example.js)
- [Playwright Integration](./examples/playwright-example.js)
- [Puppeteer Integration](./examples/puppeteer-example.js)
- [Scraping API](./examples/scraping-example.js)
- [Actor](./examples/actor-example.js)
- [Storage Usage](./examples/storage-example.js)
- [Proxies](./examples/proxies-example.js)
- [Deep SerpApi](./examples/deepserp-example.js)

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
git clone https://github.com/scrapeless-ai/sdk-node.git
cd sdk-node
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
- 🐛 **Issues**: [GitHub Issues](https://github.com/scrapeless-ai/sdk-node/issues)
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
