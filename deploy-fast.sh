#!/bin/bash
# ================================================
# 快速部署脚本 - 无需交互
# 使用方法: ./deploy-fast.sh [cloud|api|all]
# 示例: ./deploy-fast.sh cloud
# ================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CF_DIR="$PROJECT_DIR/cloudfunctions"

MODE=${1:-cloud}

log() { echo "[$(date '+%H:%M:%S')] $1"; }

# 部署云函数
deploy_cloud() {
    log "开始部署云函数..."
    cd "$PROJECT_DIR"

    for cf in "$CF_DIR"/*/; do
        CF_NAME=$(basename "$cf")
        log "部署 $CF_NAME..."

        cd "$cf"
        npm install --silent 2>/dev/null || true
        tcb fn deploy "$CF_NAME" --force --verbose
    done

    log "云函数部署完成!"
}

# 部署后台 API
deploy_api() {
    log "触发 Railway 部署..."
    cd "$PROJECT_DIR/admin-api"
    railway up 2>/dev/null || log "请确保已安装 railway CLI"
    log "Railway 部署已触发"
}

# 主流程
case $MODE in
    cloud) deploy_cloud ;;
    api) deploy_api ;;
    all) deploy_cloud && deploy_api ;;
    *) echo "用法: $0 [cloud|api|all]" ;;
esac
