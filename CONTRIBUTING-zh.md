# Scrapeless Node SDK 贡献与开发指南

感谢您关注并参与 Scrapeless Node SDK 的开源贡献！本指南同时涵盖贡献流程和开发规范。

## 如何参与贡献

### 1. 提交 Issue

- 在新建 issue 前，请先搜索 [已有 issue](https://github.com/scrapeless-ai/sdk-node/issues)。
- 请提供清晰的标题和详细描述。
- 如涉及 bug，请附上复现步骤、期望行为和相关环境信息。

### 2. 提交 Pull Request (PR)

- Fork 本仓库，并从 `main` 分支创建新分支。
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 提交规范。
- 确保代码通过 lint 和测试（`pnpm lint`、`pnpm test`）。
- 如有需要，请补充或更新文档和测试。
- 提交 PR 时请详细描述变更内容，并关联相关 issue。
- 积极响应评审意见并及时更新 PR。

### 3. 代码规范

- 使用 TypeScript，遵循现有代码风格。
- 提交前请运行 `pnpm lint` 和 `pnpm format`。
- 注释和文档应清晰、易懂。
- 新功能或修复请添加相应测试。

### 4. 分支管理

- 建议使用功能分支（如 `feature/xxx` 或 `fix/xxx`）。
- 保持 PR 聚焦单一主题，避免混合无关更改。

## 本地开发流程

### 1. 克隆与安装依赖

```bash
# 克隆仓库
git clone https://github.com/scrapeless-ai/sdk-node.git
cd sdk-node

# 安装依赖
pnpm install
```

### 2. 常用开发命令

```bash
# 运行测试
pnpm test

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 构建项目
pnpm run build

# 类型检查
pnpm typecheck
```

### 3. 项目结构

```text
src/
├── client.ts           # 主客户端类
├── services/           # API 服务实现
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── scraping-browser/   # 浏览器自动化工具
├── scraping-crawl/     # AI结构化数据收集
├── universal/          # 自动化Web内容检索
├── actor/              # Actor 系统实现
└── index.ts            # 主入口点

examples/               # 使用示例
tests/                  # 测试文件
```

## 代码质量工具

### ESLint

- 代码检查：`pnpm lint`
- 自动修复：`pnpm lint:fix`
- 类型检查：`pnpm typecheck`
- 配置文件：`eslint.config.js`

### Prettier

- 代码格式化：`pnpm format`
- 格式检查：`pnpm format:check`
- 配置文件：`.prettierrc`

### Git 钩子（Husky）

- Pre-commit：lint-staged、ESLint、Prettier
- 提交信息校验：commitlint（Conventional Commits）

### 持续集成

- GitHub Actions：`.github/workflows/lint.yml`，在 push/PR 时自动运行类型检查、lint、格式化和测试

## 最佳实践

- API 密钥和敏感信息请使用环境变量配置。
- 所有 API 调用建议使用 try-catch 包裹。
- 用完浏览器连接等资源请及时关闭和清理。
- 注意 API 速率限制，合理设置超时时间。
- 保持提交原子性，信息清晰。
- PR 前认真自查代码质量。

## 发版指南

本项目使用 [standard-version](https://github.com/conventional-changelog/standard-version) 进行自动化版本管理和发布。

### 自动发版流程

当代码推送到 `main` 分支时，GitHub Actions 会自动：

1. 检查是否有符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范的新提交
2. 如果有可发布的提交，运行测试和构建
3. 使用 `standard-version` 自动生成版本号和 CHANGELOG
4. 创建 git tag 并推送到仓库
5. 发布到 npm

### 手动发版命令

#### 基本发版

```bash
# 自动确定版本类型（patch/minor/major）
pnpm release

# 预览发版内容（不实际执行）
pnpm release:dry-run
```

#### 指定版本类型

```bash
# 补丁版本 (0.0.1 -> 0.0.2)
pnpm release:patch

# 次要版本 (0.0.1 -> 0.1.0)
pnpm release:minor

# 主要版本 (0.0.1 -> 1.0.0)
pnpm release:major
```

#### 预发布版本

```bash
# 通用预发布版本 (0.0.1 -> 0.0.2-0)
pnpm release:prerelease

# Alpha 版本 (0.0.1 -> 0.0.2-alpha.0)
pnpm release:alpha

# Beta 版本 (0.0.1 -> 0.0.2-beta.0)
pnpm release:beta
```

### 提交信息规范

本项目使用 Conventional Commits 规范，支持以下类型：

- `feat`: ✨ 新功能
- `fix`: 🐛 错误修复
- `docs`: 📚 文档更新
- `style`: 💎 代码格式（不影响功能的更改）
- `refactor`: 📦 代码重构
- `perf`: 🚀 性能优化
- `test`: 🚨 测试相关
- `build`: 🛠 构建系统或外部依赖
- `ci`: ⚙️ CI 配置文件和脚本
- `chore`: ♻️ 其他更改（不会出现在 CHANGELOG 中）
- `revert`: 🗑 回滚提交

#### 提交信息格式

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 示例

```bash
feat: 添加新的 API 端点
fix(auth): 修复登录验证问题
docs: 更新 API 文档
```

### 版本号规则

项目遵循 [Semantic Versioning](https://semver.org/) 规范：

- **MAJOR**: 不兼容的 API 更改
- **MINOR**: 向后兼容的功能添加
- **PATCH**: 向后兼容的错误修复

### CHANGELOG

所有版本更改都会自动记录在 [CHANGELOG.md](./CHANGELOG.md) 文件中，包括：

- 新功能
- 错误修复
- 重大更改
- 性能改进
- 其他重要更新

### 发布到 npm

发版完成后，包会自动发布到 npm：

```bash
npm install @scrapeless-ai/sdk
```

### 注意事项

1. 确保所有提交都遵循 Conventional Commits 规范
2. 重大更改需要在提交信息中添加 `BREAKING CHANGE:` 标记
3. 手动发版后需要推送 tags：`git push --follow-tags origin main`
4. 确保 npm 访问令牌配置正确

## 行为准则

请保持尊重与包容。我们遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。

## 联系方式

如有疑问或需支持，请提交 issue 或发送邮件至 [support@scrapeless.com](mailto:support@scrapeless.com)。

---

感谢您的贡献，让 Scrapeless Node SDK 更加完善！
