#!/bin/bash
# ================================================
# 智能部署脚本 - 只部署修改的云函数
# 使用方法: ./deploy-smart.sh
# ================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CF_DIR="$PROJECT_DIR/cloudfunctions"
ADMIN_DIR="$PROJECT_DIR/admin"
ENV_ID="liandaofutou-2gdayw0068d938b3"
STATE_FILE="$PROJECT_DIR/.deploy_state"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[部署]${NC} $1"; }
success() { echo -e "${GREEN}[成功]${NC} $1"; }
warn() { echo -e "${YELLOW}[警告]${NC} $1"; }

# 计算文件 hash（排除 node_modules）
calc_hash() {
    find "$1" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "*.map" 2>/dev/null | sort | xargs cat | md5sum | cut -d' ' -f1
}

# 读取上次部署状态
read_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "{}"
    fi
}

# 保存部署状态
save_state() {
    cat > "$STATE_FILE"
}

# 获取云端云函数列表
get_remote_functions() {
    tcb fn list --env-id "$ENV_ID" 2>/dev/null | grep -E "^│" | grep -v "函数名称" | awk '{print $2}' | grep -v "^$" | grep -v "│" || echo ""
}

# ================================================
# 1. 部署 Admin 前端
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
# 2. 部署单个云函数
# ================================================
deploy_cf() {
    local CF_NAME="$1"
    local CF_PATH="$CF_DIR/$CF_NAME"
    
    if [ ! -d "$CF_PATH" ]; then
        warn "$CF_NAME 不存在，跳过"
        return 1
    fi
    
    log "部署 $CF_NAME..."
    cd "$CF_PATH"
    npm install --silent 2>/dev/null || true
    
    # 特殊处理需要 --dir 的云函数
    if [ "$CF_NAME" == "adminproxy" ]; then
        tcb fn deploy "$CF_NAME" --force --env-id "$ENV_ID" --dir . 2>&1 | tail -2
    else
        # 大部分云函数不需要 --dir，会自动从 cloudfunctions/{name}/ 目录部署
        tcb fn deploy "$CF_NAME" --force --env-id "$ENV_ID" --dir . 2>&1 | tail -2
    fi
    
    if [ $? -eq 0 ]; then
        success "$CF_NAME 部署成功"
        return 0
    else
        warn "$CF_NAME 部署可能有问题"
        return 1
    fi
}

# ================================================
# 3. 智能部署云函数
# ================================================
deploy_cloudfunctions_smart() {
    log "开始检测云函数变更..."
    
    # 获取当前状态
    CURRENT_STATE=$(read_state)
    
    # 定义需要 --dir 参数的云函数
    NEED_DIR=("adminproxy")
    MODIFIED_CFS=()
    ALL_CFS=()
    
    # 遍历所有云函数
    for cf in "$CF_DIR"/*/; do
        CF_NAME=$(basename "$cf")
        ALL_CFS+=("$CF_NAME")
        
        # 计算当前 hash
        CURRENT_HASH=$(calc_hash "$cf")
        
        # 检查是否有变更
        LAST_HASH=$(echo "$CURRENT_STATE" | grep "^${CF_NAME}:" | cut -d: -f2)
        
        if [ -z "$LAST_HASH" ] || [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
            MODIFIED_CFS+=("$CF_NAME:$CURRENT_HASH")
        fi
    done
    
    # 显示检测结果
    if [ ${#MODIFIED_CFS[@]} -eq 0 ]; then
        log "没有检测到云函数变更"
        return
    fi
    
    echo ""
    echo "检测到以下云函数有变更："
    for cf_info in "${MODIFIED_CFS[@]}"; do
        CF_NAME="${cf_info%%:*}"
        echo "  - $CF_NAME"
    done
    echo ""
    
    # 询问确认（可跳过）
    if [ "$1" != "--yes" ] && [ "$1" != "-y" ]; then
        read -p "确认部署? (y/n): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "取消部署"
            exit 0
        fi
    fi
    
    echo ""
    
    # 部署变更的云函数
    NEW_STATE=""
    for cf_info in "${MODIFIED_CFS[@]}"; do
        CF_NAME="${cf_info%%:*}"
        CF_HASH="${cf_info##*:}"
        
        if deploy_cf "$CF_NAME"; then
            NEW_STATE="${NEW_STATE}\n${CF_NAME}:${CF_HASH}"
        fi
    done
    
    # 更新部署状态
    echo -e "$NEW_STATE" > "$STATE_FILE"
    
    # 添加未修改的云函数状态
    for cf_name in "${ALL_CFS[@]}"; do
        CF_PATH="$CF_DIR/$cf_name"
        CF_HASH=$(calc_hash "$CF_PATH")
        if ! grep -q "^${cf_name}:" "$STATE_FILE"; then
            echo "${cf_name}:${CF_HASH}" >> "$STATE_FILE"
        fi
    done
    
    success "云函数部署完成"
}

# ================================================
# 4. 强制部署指定云函数
# ================================================
deploy_cloudfunction() {
    local CF_NAME="$1"
    local CF_PATH="$CF_DIR/$CF_NAME"
    
    if [ ! -d "$CF_PATH" ]; then
        warn "$CF_NAME 不存在"
        return 1
    fi
    
    deploy_cf "$CF_NAME"
    
    # 更新状态
    CF_HASH=$(calc_hash "$CF_PATH")
    if grep -q "^${CF_NAME}:" "$STATE_FILE"; then
        sed -i '' "s/^${CF_NAME}:.*/${CF_NAME}:${CF_HASH}/" "$STATE_FILE"
    else
        echo "${CF_NAME}:${CF_HASH}" >> "$STATE_FILE"
    fi
}

# ================================================
# 5. 重置状态文件（强制全部部署）
# ================================================
reset_state() {
    log "重置部署状态..."
    rm -f "$STATE_FILE"
    success "状态已重置，下次运行将部署所有云函数"
}

# ================================================
# 主流程
# ================================================
main() {
    echo ""
    echo "=============================================="
    echo "         智能部署脚本"
    echo "=============================================="
    echo ""
    
    case "$1" in
        --admin)
            deploy_admin
            ;;
        --reset)
            reset_state
            ;;
        --list)
            log "本地云函数："
            for cf in "$CF_DIR"/*/; do
                echo "  - $(basename "$cf")"
            done
            ;;
        --force)
            # 强制部署指定云函数
            if [ -z "$2" ]; then
                warn "请指定云函数名称: ./deploy-smart.sh --force <函数名>"
                exit 1
            fi
            deploy_cloudfunction "$2"
            ;;
        --all)
            # 全量部署（重置状态后执行）
            reset_state
            deploy_admin
            deploy_cloudfunctions_smart --yes
            ;;
        -h|--help)
            echo "使用方法: ./deploy-smart.sh [选项]"
            echo ""
            echo "选项:"
            echo "  (无参数)    智能检测并部署变更的云函数"
            echo "  --admin     只部署 Admin 前端"
            echo "  --all       部署全部（Admin + 所有云函数）"
            echo "  --force <名> 强制部署指定云函数"
            echo "  --reset     重置部署状态"
            echo "  --list      列出所有本地云函数"
            echo "  -y          跳过确认直接部署"
            echo "  -h          显示帮助"
            echo ""
            exit 0
            ;;
        *)
            deploy_admin
            deploy_cloudfunctions_smart "$@"
            ;;
    esac
    
    echo ""
    echo "=============================================="
    success "部署完成！"
    echo "=============================================="
    echo ""
}

main "$@"
