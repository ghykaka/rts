#!/bin/bash
# ================================================
# 智能增量部署 - 只部署有变化的云函数
# ================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CF_DIR="$PROJECT_DIR/cloudfunctions"
STATE_FILE="$PROJECT_DIR/.deploy_state"

log() { echo "[$(date '+%H:%M:%S')] $1"; }

# 计算文件哈希
calc_hash() {
    find "$1" -type f \( -name "*.js" -o -name "*.json" -o -name "*.node" \) -exec cat {} \; 2>/dev/null | md5
}

# 获取旧状态
get_old_hash() {
    local cf_name="$1"
    if [ -f "$STATE_FILE" ]; then
        grep "^${cf_name}:" "$STATE_FILE" 2>/dev/null | cut -d: -f2
    fi
}

# 保存状态
save_state() {
    local cf_name="$1"
    local hash="$2"
    if [ ! -f "$STATE_FILE" ]; then
        touch "$STATE_FILE"
    fi
    if grep -q "^${cf_name}:" "$STATE_FILE" 2>/dev/null; then
        sed -i '' "s/^${cf_name}:.*/${cf_name}:${hash}/" "$STATE_FILE"
    else
        echo "${cf_name}:${hash}" >> "$STATE_FILE"
    fi
}

# 主流程
main() {
    log "开始检查云函数变更..."

    CHANGED=0
    DEPLOYED=0

    for cf in "$CF_DIR"/*/; do
        CF_NAME=$(basename "$cf")
        NEW_HASH=$(calc_hash "$cf")
        OLD_HASH=$(get_old_hash "$CF_NAME")

        if [ "$NEW_HASH" != "$OLD_HASH" ] && [ -n "$NEW_HASH" ]; then
            log "检测到变更: $CF_NAME"
            CHANGED=1

            cd "$cf"
            npm install --silent 2>/dev/null || true
            if tcb fn deploy "$CF_NAME" --force; then
                DEPLOYED=$((DEPLOYED + 1))
                save_state "$CF_NAME" "$NEW_HASH"
                log "部署成功: $CF_NAME"
            else
                log "部署失败: $CF_NAME"
            fi
        fi
    done

    if [ $CHANGED -eq 0 ]; then
        log "没有检测到变更，所有云函数已是最新"
    else
        log "共部署 $DEPLOYED 个云函数"
    fi
}

main
