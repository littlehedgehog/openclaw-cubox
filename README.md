# Cubox Plugin for OpenClaw

Save URLs to [Cubox](https://cubox.pro) bookmark service directly from OpenClaw.

## Features

- Save URLs with one command
- Optional title, tags, folder, and description
- Automatic retry with exponential backoff
- Network error handling
- Cross-platform compatibility (macOS and Linux)

## Prerequisites

- OpenClaw installed
- Cubox Premium account (API requires premium)
- Node.js 18+
- npm package manager

## Installation

### Quick Install

```bash
cd /path/to/cubox
./install.sh
```

### Platform-Specific Instructions

#### macOS
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

#### Linux
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

### Manual Install

1. Clone or download this repository

2. Install dependencies and compile:
   ```bash
   npm install
   npm run build
   ```

3. Copy to OpenClaw extensions directory:
   ```bash
   mkdir -p ~/.openclaw/extensions/cubox
   cp index.js package.json openclaw.plugin.json ~/.openclaw/extensions/cubox/
   cp -r skills ~/.openclaw/extensions/cubox/
   ```

## Configuration

1. Get your Cubox API URL:
   - Open Cubox app or web client
   - Go to **Settings → Extensions → API**
   - Enable API and copy the endpoint URL
   - Format: `https://cubox.pro/c/api/save/<your-token>`

2. Create config file:
   ```bash
   nano ~/.openclaw/extensions/cubox/config.json
   ```

3. Add your API URL:
   ```json
   {
     "apiUrl": "https://cubox.pro/c/api/save/YOUR_TOKEN_HERE"
   }
   ```

4. Restart OpenClaw Gateway:
   ```bash
   openclaw gateway restart
   ```

## Usage

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

## Troubleshooting

### Common Issues

- **Node.js not found**: Ensure Node.js 18+ is installed and in your PATH
- **Permission denied**: Run `chmod +x install.sh` to make the script executable
- **Compilation fails**: Check that TypeScript and dependencies are properly installed
- **OpenClaw not found**: Ensure OpenClaw is installed and properly configured

### Platform-Specific Notes

- **macOS**: May require granting terminal permissions for script execution
- **Linux**: Ensure your user has appropriate permissions for the OpenClaw extensions directory

## Files

| File | Description |
|------|-------------|
| `index.ts` | Plugin main entry (TypeScript source) |
| `openclaw.plugin.json` | Plugin definition for OpenClaw |
| `skills/SKILL.md` | Skill documentation for AI |
| `config.example.json` | Configuration template |
| `package.json` | npm package definition |
| `tsconfig.json` | TypeScript configuration |
| `install.sh` | Installation script |

## Development

```bash
# Install dev dependencies
npm install

# Build
npm run build

# Watch mode
npm run build -- --watch
```

## License

MIT

## Author

OpenClaw Community

## Links

- [Cubox](https://cubox.pro)
- [OpenClaw](https://openclaw.ai)
- [Report Issues](https://github.com/littlehedgehog/openclaw-cubox/issues)
