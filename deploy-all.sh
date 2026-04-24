#!/bin/bash
# ================================================
# 一键部署脚本 - 部署前端 + 云函数
# 使用方法: ./deploy-all.sh
# ================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CF_DIR="$PROJECT_DIR/cloudfunctions"
ADMIN_DIR="$PROJECT_DIR/admin"
ENV_ID="liandaofutou-2gdayw0068d938b3"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[部署]${NC} $1"; }
success() { echo -e "${GREEN}[成功]${NC} $1"; }
warn() { echo -e "${YELLOW}[警告]${NC} $1"; }

# ================================================
# 1. 构建并部署 Admin 前端
# ================================================
deploy_admin() {
    log "开始构建 Admin 前端..."
    cd "$ADMIN_DIR"
    
    npm run build 2>&1 | tail -5
    
    log "部署 Admin 前端到 CloudBase..."
    tcb hosting deploy dist --env-id "$ENV_ID" 2>&1 | tail -3
    
    success "Admin 前端部署完成"
}

# ================================================
# 2. 部署云函数
# ================================================
deploy_cloudfunctions() {
    log "开始部署云函数..."
    
    # 定义需要 --dir 参数的云函数
    NEED_DIR=("adminproxy" "paymentNotify")
    
    is_need_dir() {
        for cf in "${NEED_DIR[@]}"; do
            [[ "$cf" == "$1" ]] && return 0
        done
        return 1
    }
    
    for cf in "$CF_DIR"/*/; do
        CF_NAME=$(basename "$cf")
        log "部署 $CF_NAME..."
        
        cd "$cf"
        npm install --silent 2>/dev/null || true
        
        if is_need_dir "$CF_NAME"; then
            echo "1" | tcb fn deploy "$CF_NAME" --force --env-id "$ENV_ID" --dir . 2>&1 | grep -E "(成功|失败)" || true
        else
            echo "1" | tcb fn deploy "$CF_NAME" --force --env-id "$ENV_ID" 2>&1 | grep -E "(成功|失败)" || true
        fi
        
        if [ $? -eq 0 ]; then
            success "$CF_NAME 部署成功"
        else
            warn "$CF_NAME 部署可能有问题"
        fi
    done
    
    success "云函数部署完成"
}

# ================================================
# 主流程
# ================================================
main() {
    echo ""
    echo "=============================================="
    echo "         一键部署脚本"
    echo "=============================================="
    echo ""
    
    deploy_admin
    echo ""
    deploy_cloudfunctions
    
    echo ""
    echo "=============================================="
    success "全部部署完成！"
    echo "=============================================="
    echo ""
    echo "访问地址: https://liandaofutou-2gdayw0068d938b3-1417102114.tcloudbaseapp.com"
    echo ""
}

main
