#!/bin/bash

# Cubox Plugin 安装脚本
# Install script for Cubox OpenClaw plugin

set -e

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        Darwin*)
            echo "macOS"
            ;;
        Linux*)
            echo "Linux"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

PLUGIN_NAME="cubox"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OS_TYPE=$(detect_os)

echo "🦞 Installing Cubox plugin for OpenClaw..."
echo "Operating System: $OS_TYPE"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION detected."
    echo "   This plugin requires Node.js 18 or higher for optimal performance."
fi

# 检查 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "⚠️  Warning: 'openclaw' command not found."
    echo "   Make sure OpenClaw is installed before using the plugin."
fi

# 进入插件目录
cd "$SCRIPT_DIR"

# 安装依赖
echo "📦 Installing dependencies..."
npm install --production=false

# 编译 TypeScript
echo "🔧 Compiling TypeScript..."
npm run build

# 检查编译结果
if [ ! -f "index.js" ]; then
    echo "❌ Error: Compilation failed. index.js not found."
    exit 1
fi

# 确定安装目录
OPENCLAW_EXT_DIR="${OPENCLAW_EXTENSIONS_DIR:-$HOME/.openclaw/extensions}"
INSTALL_DIR="$OPENCLAW_EXT_DIR/$PLUGIN_NAME"

echo ""
echo "📁 Installing to: $INSTALL_DIR"

# 创建目录
mkdir -p "$INSTALL_DIR"

# 复制必要文件
cp index.js "$INSTALL_DIR/"
cp package.json "$INSTALL_DIR/"
cp openclaw.plugin.json "$INSTALL_DIR/"

# 复制 skills 目录
if [ -d "skills" ]; then
    cp -r skills "$INSTALL_DIR/"
fi

# 复制 README
if [ -f "README.md" ]; then
    cp README.md "$INSTALL_DIR/"
fi

# 复制 LICENSE (if exists)
if [ -f "LICENSE" ] || [ -f "LICENSE.md" ]; then
    if [ -f "LICENSE" ]; then
        cp LICENSE "$INSTALL_DIR/"
    elif [ -f "LICENSE.md" ]; then
        cp LICENSE.md "$INSTALL_DIR/"
    fi
fi

# 复制 node_modules（如果需要）
if [ -d "node_modules" ]; then
    cp -r node_modules "$INSTALL_DIR/"
fi

echo ""
echo "✅ Cubox plugin installed successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Get your Cubox API URL:"
echo "   - Open Cubox app → Settings → Extensions → API"
echo "   - Copy the endpoint URL (includes your token)"
echo ""
echo "2. Configure the plugin in OpenClaw main config file:"
echo "   Edit ~/.openclaw/openclaw.json"
echo ""
echo "   Add under 'plugins.entries.cubox.config':"
echo '   {'
echo '     "plugins": {'
echo '       "enabled": true,'
echo '       "entries": {'
echo '         "cubox": {'
echo '           "config": {'
echo '             "apiUrl": "https://cubox.pro/c/api/save/YOUR_TOKEN"'
echo '           }'
echo '         }'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "3. Restart OpenClaw Gateway:"
echo "   openclaw gateway restart"
echo ""
echo "4. Test the plugin:"
echo "   Send: save https://example.com"
echo ""