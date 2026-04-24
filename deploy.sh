#!/bin/bash
# ================================================
# 小程序 + 后台 一键部署脚本
# 使用方法: ./deploy.sh
# ================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
CF_DIR="$PROJECT_DIR/cloudfunctions"
ADMIN_API_DIR="$PROJECT_DIR/admin-api"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=============================================="
echo "         小程序 + 后台 一键部署脚本"
echo "=============================================="
echo ""

# ================================================
# 第一部分：部署微信云函数
# ================================================
deploy_cloudfunctions() {
    log_info "开始部署微信云函数..."
    echo ""

    cd "$PROJECT_DIR"

    # 获取所有云函数目录
    CLOUD_FUNCTIONS=$(find "$CF_DIR" -mindepth 1 -maxdepth 1 -type d)

    for cf in $CLOUD_FUNCTIONS; do
        CF_NAME=$(basename "$cf")
        log_info "部署云函数: $CF_NAME ..."

        # 检查依赖
        if [ -f "$cf/package.json" ]; then
            log_info "  安装依赖..."
            cd "$cf" && npm install --silent 2>/dev/null || true
            cd "$PROJECT_DIR"
        fi

        # 部署云函数
        tcb fn deploy "$CF_NAME" --force

        if [ $? -eq 0 ]; then
            log_success "  $CF_NAME 部署成功"
        else
            log_error "  $CF_NAME 部署失败"
        fi
        echo ""
    done

    log_success "微信云函数部署完成！"
}

# ================================================
# 第二部分：部署后台 API (Railway)
# ================================================
deploy_admin_api() {
    log_info "检查后台 API 部署状态..."
    echo ""

    if [ ! -d "$ADMIN_API_DIR" ]; then
        log_warn "后台 API 目录不存在，跳过后台部署"
        return
    fi

    # Railway 部署提示
    echo "Railway 部署方式："
    echo "  1. 代码已推送到 GitHub"
    echo "  2. Railway 会自动检测到变更并部署"
    echo "  3. 或者手动在 Railway 控制台点击 Redeploy"
    echo ""
    echo "  查看部署状态: https://railway.app/dashboard"
    echo ""

    # 如果本地有 railway CLI，可以触发部署
    if command -v railway &> /dev/null; then
        read -p "是否触发 Railway 部署? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$ADMIN_API_DIR"
            railway up
            log_success "Railway 部署已触发"
        fi
    else
        log_info "提示: 安装 railway CLI 可以实现自动化部署"
        log_info "  npm install -g @railway/cli"
        log_info "  railway login"
    fi
}

# ================================================
# 主流程
# ================================================
main() {
    # 检查 tcb CLI
    if ! command -v tcb &> /dev/null; then
        log_error "tcb CLI 未安装，请先安装:"
        echo "  npm install -g @cloudbase/cli"
        exit 1
    fi

    # 检查是否登录
    log_info "检查登录状态..."
    if ! tcb env list &> /dev/null; then
        log_warn "未检测到登录状态，请先登录:"
        echo "  tcb login"
        exit 1
    fi
    log_success "已登录"

    echo ""
    echo "请选择部署范围:"
    echo "  1. 仅部署云函数"
    echo "  2. 仅部署后台 API"
    echo "  3. 全部部署"
    echo "  4. 查看部署状态"
    read -p "请输入选项 [1-4]: " choice

    case $choice in
        1)
            deploy_cloudfunctions
            ;;
        2)
            deploy_admin_api
            ;;
        3)
            deploy_cloudfunctions
            echo ""
            deploy_admin_api
            ;;
        4)
            log_info "云函数列表:"
            tcb fn list
            ;;
        *)
            log_error "无效选项"
            exit 1
            ;;
    esac

    echo ""
    echo "=============================================="
    log_success "部署脚本执行完成！"
    echo "=============================================="
}

main "$@"
