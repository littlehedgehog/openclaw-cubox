# Cubox Plugin for OpenClaw

## English

Save URLs to [Cubox](https://cubox.pro) bookmark service directly from OpenClaw.

### Features

- Save URLs with one command
- Optional title, tags, folder, and description
- Automatic retry with exponential backoff
- Network error handling
- Cross-platform compatibility (macOS and Linux)

### Prerequisites

- OpenClaw installed
- Cubox Premium account (API requires premium)
- Node.js 18+
- npm package manager

### Installation

This plugin supports two primary installation methods:

Naming note:
- npm package name: `@hedgehog-labs/openclaw-cubox`
- OpenClaw plugin id: `cubox`
- OpenClaw config key: `plugins.entries.cubox`

OpenClaw may warn that the npm package name and plugin id are different. That is expected for this package.

#### Method 1: Install from npm with OpenClaw

Recommended for normal usage:

```bash
openclaw plugins install @hedgehog-labs/openclaw-cubox
```

#### Method 2: Install from local source with `install.sh`

Recommended for local development or end-to-end validation from the current checkout:

```bash
git clone https://github.com/littlehedgehog/openclaw-cubox.git
cd openclaw-cubox
./install.sh
```

`install.sh` does three things:
- install dependencies with `npm ci`
- build `dist/index.js`
- generate a local `.tgz` via `npm pack` and install it with `openclaw plugins install` when `openclaw` is available

#### Manual local packaging flow

If you want the same local-source path without using `install.sh`, run:

```bash
git clone https://github.com/littlehedgehog/openclaw-cubox.git
cd openclaw-cubox
npm ci
npm run build
npm pack
openclaw plugins install ./hedgehog-labs-openclaw-cubox-*.tgz
```

#### Platform-Specific Notes

##### macOS
1. Ensure you have Node.js 18+ installed:
   ```bash
   node --version
   ```
   
2. Download or clone the repository:
   ```bash
   git clone https://github.com/littlehedgehog/openclaw-cubox.git
   cd openclaw-cubox
   ```

3. Run the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

##### Linux
1. Ensure you have Node.js 18+ installed:
   ```bash
   node --version
   ```
   
2. Download or clone the repository:
   ```bash
   git clone https://github.com/littlehedgehog/openclaw-cubox.git
   cd openclaw-cubox
   ```

3. Run the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

### Configuration

**IMPORTANT**: The plugin does NOT load `config.json` from the plugin directory automatically.
All configuration must be in OpenClaw's main config file (`~/.openclaw/openclaw.json`).

1. Get your Cubox API URL:
   - Open Cubox app or web client
   - Go to **Settings → Extensions → API**
   - Enable API and copy the endpoint URL
   - Format: `https://cubox.pro/c/api/save/<your-token>`

2. Edit OpenClaw main config file:
   ```bash
   nano ~/.openclaw/openclaw.json
   ```

3. Add plugin configuration under `plugins.entries.cubox.config`:
   ```json
   {
     "plugins": {
       "enabled": true,
       "entries": {
         "cubox": {
           "config": {
             "apiUrl": "https://cubox.pro/c/api/save/YOUR_TOKEN_HERE"
           }
         }
       }
     }
   }
   ```

4. Restart OpenClaw Gateway:
   ```bash
   openclaw gateway restart
   ```

### Usage

Once installed, you can save URLs to Cubox:

```
收藏 https://example.com
save https://example.com
bookmark this URL: https://example.com
```

With options:
```
收藏 https://example.com --title="My Article" --tag=tech
save https://example.com to folder "Reading"
```

### Installation Warnings

Depending on your OpenClaw version, you may see some warnings during `openclaw plugins install`.

- `Plugin manifest id "cubox" differs from npm package name "openclaw-cubox"`
  This comes from OpenClaw comparing the plugin manifest id with the npm package basename.
  OpenClaw will still use `cubox` as the actual plugin id and config key.

- `plugins.allow is empty; discovered non-bundled plugins may auto-load`
  This is an OpenClaw safety warning, not a plugin build failure.
  If you want an explicit allowlist, add `cubox` to `plugins.allow` in your OpenClaw config.

- `plugins.entries.cubox: plugin id mismatch (manifest uses "cubox", entry hints "openclaw-cubox")`
  This is the same package-name-vs-manifest-id warning reflected in config validation.
  Use `plugins.entries.cubox` as the config key.

### Troubleshooting

#### Common Issues

- **Node.js not found**: Ensure Node.js 18+ is installed and in your PATH
- **Permission denied**: Run `chmod +x install.sh` to make the script executable
- **Build fails**: Check that dependencies are installed, then run `npm run build`
- **OpenClaw not found**: Ensure OpenClaw is installed and properly configured
- **Installed to wrong path (`~/.openclaw/.openclaw/...`)**: run `unset OPENCLAW_HOME` and reinstall
- **Dangerous code pattern warning during install**: update to a build that reads the Cubox endpoint only from `plugins.entries.cubox.config.apiUrl` instead of environment variables

#### Platform-Specific Notes

- **macOS**: May require granting terminal permissions for script execution
- **Linux**: Ensure your user has appropriate permissions for the OpenClaw extensions directory

### Files

| File | Description |
|------|-------------|
| `index.ts` | Plugin main entry (TypeScript source) |
| `dist/index.js` | Bundled runtime entry for OpenClaw |
| `openclaw.plugin.json` | Plugin definition for OpenClaw |
| `skills/SKILL.md` | Skill documentation for AI |
| `package.json` | npm package definition |
| `tsconfig.json` | TypeScript type-check configuration |
| `install.sh` | Local build + install helper |

### Development

```bash
# Install dev dependencies
npm ci

# Build
npm run build

# Pack local release
npm pack

# Type check
npm run typecheck
```

### License

MIT

### Author

littlehedgehog@qq.com

### Links

- [Cubox](https://cubox.pro)
- [OpenClaw](https://openclaw.ai)
- [Report Issues](https://github.com/littlehedgehog/openclaw-cubox/issues)

## 中文说明

从 OpenClaw 直接保存 URL 到 [Cubox](https://cubox.pro) 书签服务。

### 功能

- 一条命令保存链接
- 支持可选标题、标签、文件夹和描述
- 自动重试和指数退避
- 处理常见网络错误
- 支持 macOS 和 Linux

### 前置要求

- 已安装 OpenClaw
- Cubox Premium 账号（API 需要高级版）
- Node.js 18+
- npm

### 安装

这个插件主要有两种安装方式：

命名说明：
- npm 包名：`@hedgehog-labs/openclaw-cubox`
- OpenClaw 插件 id：`cubox`
- OpenClaw 配置 key：`plugins.entries.cubox`

如果 OpenClaw 提示 npm 包名和插件 id 不一致，这是预期行为。

#### 方式 1：通过 npm 和 OpenClaw 安装

适合正常使用：

```bash
openclaw plugins install @hedgehog-labs/openclaw-cubox
```

#### 方式 2：通过本地源码和 `install.sh` 安装

适合本地开发，或者基于当前仓库做端到端验证：

```bash
git clone https://github.com/littlehedgehog/openclaw-cubox.git
cd openclaw-cubox
./install.sh
```

`install.sh` 会执行三件事：
- 用 `npm ci` 安装依赖
- 构建 `dist/index.js`
- 用 `npm pack` 生成本地 `.tgz`，并在 `openclaw` 可用时调用 `openclaw plugins install` 安装

#### 手动本地打包流程

如果你想走和 `install.sh` 等价的本地安装流程，但不直接使用脚本，可以执行：

```bash
git clone https://github.com/littlehedgehog/openclaw-cubox.git
cd openclaw-cubox
npm ci
npm run build
npm pack
openclaw plugins install ./hedgehog-labs-openclaw-cubox-*.tgz
```

#### 平台说明

##### macOS
1. 确认已经安装 Node.js 18+
   ```bash
   node --version
   ```

2. 下载或克隆仓库
   ```bash
   git clone https://github.com/littlehedgehog/openclaw-cubox.git
   cd openclaw-cubox
   ```

3. 运行安装脚本
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

##### Linux
1. 确认已经安装 Node.js 18+
   ```bash
   node --version
   ```

2. 下载或克隆仓库
   ```bash
   git clone https://github.com/littlehedgehog/openclaw-cubox.git
   cd openclaw-cubox
   ```

3. 运行安装脚本
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

### 配置

**重要**：插件不会自动读取插件目录中的 `config.json`。
所有配置都需要写在 OpenClaw 主配置文件 `~/.openclaw/openclaw.json` 中。

1. 获取你的 Cubox API URL
   - 打开 Cubox App 或 Web
   - 进入 **Settings → Extensions → API**
   - 启用 API 并复制 endpoint
   - 格式类似：`https://cubox.pro/c/api/save/<your-token>`

2. 编辑 OpenClaw 主配置文件

```bash
nano ~/.openclaw/openclaw.json
```

3. 在 `plugins.entries.cubox.config` 下添加插件配置

```json
{
  "plugins": {
    "enabled": true,
    "entries": {
      "cubox": {
        "config": {
          "apiUrl": "https://cubox.pro/c/api/save/YOUR_TOKEN_HERE"
        }
      }
    }
  }
}
```

4. 重启 OpenClaw Gateway

```bash
openclaw gateway restart
```

### 使用方式

安装完成后，你可以这样保存 URL 到 Cubox：

```text
收藏 https://example.com
save https://example.com
bookmark this URL: https://example.com
```

带可选参数的示例：

```text
收藏 https://example.com --title="My Article" --tag=tech
save https://example.com to folder "Reading"
```

### 安装警告

根据 OpenClaw 版本不同，执行 `openclaw plugins install` 时你可能会看到一些 warning。

- `Plugin manifest id "cubox" differs from npm package name "openclaw-cubox"`
  这是 OpenClaw 在比较插件 manifest id 和 npm 包 basename。
  实际运行时仍然会使用 `cubox` 作为插件 id 和配置 key。

- `plugins.allow is empty; discovered non-bundled plugins may auto-load`
  这是 OpenClaw 的安全提示，不表示插件构建或安装失败。
  如果你想显式配置 allowlist，可以在 OpenClaw 配置里把 `cubox` 加入 `plugins.allow`。

- `plugins.entries.cubox: plugin id mismatch (manifest uses "cubox", entry hints "openclaw-cubox")`
  这是上面那条包名和插件 id 不一致 warning 在配置校验阶段的体现。
  配置时请继续使用 `plugins.entries.cubox`。

### 故障排查

#### 常见问题

- **找不到 Node.js**：确认已安装 Node.js 18+，并且在 PATH 中
- **Permission denied**：执行 `chmod +x install.sh`
- **构建失败**：先确认依赖已安装，再执行 `npm run build`
- **找不到 OpenClaw**：确认 OpenClaw 已正确安装并可执行
- **安装到了错误路径（`~/.openclaw/.openclaw/...`）**：执行 `unset OPENCLAW_HOME` 后重新安装
- **安装时出现 dangerous code pattern warning**：请使用只从 `plugins.entries.cubox.config.apiUrl` 读取配置的新构建版本，不再依赖环境变量

#### 平台说明

- **macOS**：可能需要给终端授予执行脚本的权限
- **Linux**：确认当前用户对 OpenClaw 扩展目录有足够权限

### 文件说明

| 文件 | 说明 |
|------|------|
| `index.ts` | 插件主入口（TypeScript 源码） |
| `dist/index.js` | OpenClaw 使用的打包产物 |
| `openclaw.plugin.json` | OpenClaw 插件定义 |
| `skills/SKILL.md` | AI skill 说明 |
| `package.json` | npm 包定义 |
| `tsconfig.json` | TypeScript 类型检查配置 |
| `install.sh` | 本地构建和安装辅助脚本 |

### 开发

```bash
# 安装开发依赖
npm ci

# 构建
npm run build

# 打包本地发布产物
npm pack

# 类型检查
npm run typecheck
```

### 许可证

MIT

### 作者

littlehedgehog@qq.com

### 链接

- [Cubox](https://cubox.pro)
- [OpenClaw](https://openclaw.ai)
- [问题反馈](https://github.com/littlehedgehog/openclaw-cubox/issues)
