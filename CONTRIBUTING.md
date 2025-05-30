# Contributing & Development Guide for Scrapeless Node SDK

Thank you for your interest in contributing to the Scrapeless Node SDK! This document covers both contribution guidelines and development workflow.

## How to Contribute

### 1. Reporting Issues

- Search [existing issues](https://github.com/scrapeless-ai/sdk-node/issues) before opening a new one.
- Provide a clear and descriptive title and detailed information.
- Include steps to reproduce, expected behavior, and environment details if relevant.

### 2. Submitting Pull Requests (PRs)

- Fork the repository and create your branch from `main`.
- Follow the [commit message guidelines](https://www.conventionalcommits.org/).
- Ensure your code passes linting and tests (`pnpm lint`, `pnpm test`).
- Add or update documentation and tests as needed.
- Open a PR with a clear description of your changes and link to any relevant issues.
- Respond to review feedback and update your PR as needed.

### 3. Code Style & Guidelines

- Use TypeScript and follow the existing code style.
- Run `pnpm lint` and `pnpm format` before committing.
- Write clear, descriptive comments and documentation.
- Add tests for new features or bug fixes.

### 4. Branching Model

- Work on feature branches (e.g., `feature/your-feature` or `fix/your-bug`).
- Keep PRs focused and small; avoid mixing unrelated changes.

## Local Development Workflow

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/scrapeless-ai/sdk-node.git
cd sdk-node

# Install dependencies
pnpm install
```

### 2. Common Development Commands

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Build the project
pnpm run build

# Type checking
pnpm typecheck
```

### 3. Project Structure

```text
src/
├── client.ts           # Main client class
├── services/           # API service implementations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── scraping-browser/   # Browser automation utilities
├── scraping-crawl/     # AI-powered structured data collection
├── universal/          # Automated web content retrieval
├── actor/              # Actor system implementation
└── index.ts           # Main entry point

examples/               # Usage examples
tests/                  # Test files
```

## Code Quality Tools

### ESLint

- Lint code: `pnpm lint`
- Auto-fix: `pnpm lint:fix`
- Type checking: `pnpm typecheck`
- Config: `eslint.config.js`

### Prettier

- Format code: `pnpm format`
- Check format: `pnpm format:check`
- Config: `.prettierrc`

### Git Hooks (Husky)

- Pre-commit: lint-staged, ESLint, Prettier
- Commit message: commitlint (Conventional Commits)

### Continuous Integration

- GitHub Actions: `.github/workflows/lint.yml` runs typecheck, lint, format, and tests on push/PR

## Best Practices

- Use environment variables for API keys and secrets.
- Always wrap API calls in try-catch blocks.
- Close browser connections and clean up resources after use.
- Be mindful of API rate limits and set appropriate timeouts.
- Make small, atomic commits with clear messages.
- Review code quality in PRs.

## Release Guide

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated version management and publishing.

### Automated Release Process

When code is pushed to the `main` branch, GitHub Actions will automatically:

1. Check for new commits that follow [Conventional Commits](https://www.conventionalcommits.org/) specification
2. If there are releasable commits, run tests and build
3. Use `standard-version` to automatically generate version numbers and CHANGELOG
4. Create git tags and push to repository
5. Publish to npm

### Manual Release Commands

#### Basic Release

```bash
# Automatically determine version type (patch/minor/major)
pnpm release

# Preview release content (dry run)
pnpm release:dry-run
```

#### Specify Version Type

```bash
# Patch version (0.0.1 -> 0.0.2)
pnpm release:patch

# Minor version (0.0.1 -> 0.1.0)
pnpm release:minor

# Major version (0.0.1 -> 1.0.0)
pnpm release:major
```

#### Pre-release Versions

```bash
# Generic pre-release (0.0.1 -> 0.0.2-0)
pnpm release:prerelease

# Alpha version (0.0.1 -> 0.0.2-alpha.0)
pnpm release:alpha

# Beta version (0.0.1 -> 0.0.2-beta.0)
pnpm release:beta
```

### Commit Message Conventions

This project uses Conventional Commits specification with the following types:

- `feat`: ✨ New features
- `fix`: 🐛 Bug fixes
- `docs`: 📚 Documentation updates
- `style`: 💎 Code style changes (formatting, etc.)
- `refactor`: 📦 Code refactoring
- `perf`: 🚀 Performance improvements
- `test`: 🚨 Test-related changes
- `build`: 🛠 Build system or external dependencies
- `ci`: ⚙️ CI configuration files and scripts
- `chore`: ♻️ Other changes (won't appear in CHANGELOG)
- `revert`: 🗑 Revert commits

#### Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Examples

```bash
feat: add new API endpoint
fix(auth): resolve login validation issue
docs: update API documentation
```

### Version Number Rules

The project follows [Semantic Versioning](https://semver.org/) specification:

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible feature additions
- **PATCH**: Backward-compatible bug fixes

### CHANGELOG

All version changes are automatically recorded in [CHANGELOG.md](./CHANGELOG.md), including:

- New features
- Bug fixes
- Breaking changes
- Performance improvements
- Other important updates

### Publishing to npm

After release completion, the package is automatically published to npm:

```bash
npm install @scrapeless-ai/sdk
```

### Important Notes

1. Ensure all commits follow Conventional Commits specification
2. Breaking changes require `BREAKING CHANGE:` marker in commit message
3. After manual release, push tags: `git push --follow-tags origin main`
4. Ensure npm access token is configured correctly

## Code of Conduct

Please be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

## Contact

For questions or support, open an issue or email [support@scrapeless.com](mailto:support@scrapeless.com).

---

Thank you for helping make Scrapeless Node SDK better!
