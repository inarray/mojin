<template>
    <view class="plan-card" :class="[`mode-${plan.mode}`]">
        <!-- 卡片头部 -->
        <view class="card-header">
            <view class="mode-info">
                <view class="mode-icon-wrap">
                    <text class="mode-icon">{{ modeIcons[plan.mode] }}</text>
                </view>
                <view class="mode-text">
                    <text class="mode-name">{{ plan.modeName }}</text>
                    <text class="mode-desc">{{ plan.modeDesc }}</text>
                </view>
            </view>
            <view class="refresh-btn" @click="handleRefresh">
                <text class="refresh-text">换一个</text>
            </view>
        </view>

        <!-- 主内容区 -->
        <view class="card-body">
            <!-- 菜品信息 -->
            <view class="dish-row">
                <text class="dish-title">{{ plan.template.title }}</text>
                <text class="price-range">{{ plan.template.price_range_text }}</text>
            </view>

            <!-- 标签 -->
            <view class="tags-row">
                <view
                    v-for="tag in plan.template.tags.slice(0, 3)"
                    :key="tag"
                    class="tag-item"
                >
                    {{ tag }}
                </view>
            </view>

            <!-- 操作区块 -->
            <view class="actions-area">
                <!-- 搜索词 -->
                <view class="action-item">
                    <view class="action-label">
                        <view class="step-num">1</view>
                        <text class="label-text">搜索词</text>
                    </view>
                    <view class="action-content">
                        <text class="content-value">{{ plan.template.search_keywords }}</text>
                        <view class="copy-btn" @click="handleCopySearch">
                            <text class="copy-text">复制</text>
                        </view>
                    </view>
                </view>

                <!-- 备注口令 -->
                <view class="action-item" v-if="plan.remarkText">
                    <view class="action-label">
                        <view class="step-num">2</view>
                        <text class="label-text">备注口令</text>
                    </view>
                    <view class="action-content">
                        <text class="content-value remark">{{ plan.remarkText }}</text>
                        <view class="copy-btn secondary" @click="handleCopyRemark">
                            <text class="copy-text">复制</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 小提示 -->
            <view class="tip-row" v-if="plan.template.avoid_tips">
                <text class="tip-icon">💡</text>
                <text class="tip-text">{{ plan.template.avoid_tips }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import type { PlanResult } from '@/utils/generate'
import { trackCopySearch, trackCopyRemark, trackRefreshPlan } from '@/api/track'

const props = defineProps<{
    plan: PlanResult
}>()

const emit = defineEmits<{
    (e: 'copySearch', text: string): void
    (e: 'copyRemark', text: string): void
    (e: 'refresh', mode: string): void
}>()

// 模式图标映射
const modeIcons: Record<string, string> = {
    cheap: '💰',
    light: '🥗',
    easy: '⚡'
}

// 复制搜索词
function handleCopySearch() {
    const text = props.plan.template.search_keywords
    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: '已复制，去外卖平台粘贴搜索',
                icon: 'none',
                duration: 2000
            })
            trackCopySearch({
                mode: props.plan.mode,
                plan_title: props.plan.template.title
            })
        }
    })
    emit('copySearch', text)
}

// 复制备注口令
function handleCopyRemark() {
    const text = props.plan.remarkText
    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: '已复制，下单时粘贴到备注',
                icon: 'none',
                duration: 2000
            })
            trackCopyRemark({
                mode: props.plan.mode,
                plan_title: props.plan.template.title
            })
        }
    })
    emit('copyRemark', text)
}

// 换一个
function handleRefresh() {
    trackRefreshPlan({
        mode: props.plan.mode,
        plan_title: props.plan.template.title
    })
    emit('refresh', props.plan.mode)
}
</script>

<style lang="scss" scoped>
.plan-card {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-radius: 20rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

    &.mode-cheap {
        .card-header {
            background: rgba(52, 199, 89, 0.12);
        }
        .mode-icon-wrap {
            background: rgba(52, 199, 89, 0.15);
        }
        .mode-name {
            color: #248a3d;
        }
    }

    &.mode-light {
        .card-header {
            background: rgba(90, 200, 250, 0.12);
        }
        .mode-icon-wrap {
            background: rgba(90, 200, 250, 0.15);
        }
        .mode-name {
            color: #0077ed;
        }
    }

    &.mode-easy {
        .card-header {
            background: rgba(255, 159, 10, 0.12);
        }
        .mode-icon-wrap {
            background: rgba(255, 159, 10, 0.15);
        }
        .mode-name {
            color: #c93400;
        }
    }
}

.card-header {
    padding: 20rpx 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mode-info {
    display: flex;
    align-items: center;
}

.mode-icon-wrap {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14rpx;
}

.mode-icon {
    font-size: 26rpx;
}

.mode-text {
    display: flex;
    flex-direction: column;
}

.mode-name {
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1.3;
}

.mode-desc {
    font-size: 22rpx;
    color: #86868b;
    margin-top: 2rpx;
}

.refresh-btn {
    padding: 10rpx 18rpx;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 16rpx;

    &:active {
        background: rgba(0, 0, 0, 0.08);
    }
}

.refresh-text {
    font-size: 22rpx;
    color: #86868b;
}

.card-body {
    padding: 20rpx 24rpx;
}

.dish-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 14rpx;
}

.dish-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1d1d1f;
    flex: 1;
}

.price-range {
    font-size: 26rpx;
    font-weight: 500;
    color: #86868b;
    margin-left: 16rpx;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 20rpx;
}

.tag-item {
    font-size: 22rpx;
    color: #86868b;
    background: rgba(0, 0, 0, 0.04);
    padding: 6rpx 14rpx;
    border-radius: 10rpx;
}

.actions-area {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 14rpx;
    padding: 4rpx;
    margin-bottom: 16rpx;
}

.action-item {
    padding: 16rpx;
    border-bottom: 0.5rpx solid rgba(0, 0, 0, 0.05);

    &:last-child {
        border-bottom: none;
    }
}

.action-label {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
}

.step-num {
    width: 28rpx;
    height: 28rpx;
    background: #1d1d1f;
    color: #fff;
    font-size: 18rpx;
    font-weight: 600;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10rpx;
}

.label-text {
    font-size: 22rpx;
    color: #86868b;
}

.action-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 14rpx 18rpx;
    border-radius: 12rpx;
}

.content-value {
    flex: 1;
    font-size: 28rpx;
    color: #1d1d1f;
    font-weight: 500;

    &.remark {
        font-size: 26rpx;
        color: #3d3d3d;
        font-weight: normal;
    }
}

.copy-btn {
    display: flex;
    align-items: center;
    background: #1d1d1f;
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    margin-left: 14rpx;

    &:active {
        opacity: 0.8;
        transform: scale(0.96);
    }

    &.secondary {
        background: rgba(0, 0, 0, 0.06);

        .copy-text {
            color: #1d1d1f;
        }
    }
}

.copy-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;
}

.tip-row {
    display: flex;
    align-items: flex-start;
    padding: 14rpx 18rpx;
    background: rgba(255, 204, 0, 0.1);
    border-radius: 12rpx;
}

.tip-icon {
    font-size: 22rpx;
    margin-right: 10rpx;
    margin-top: 2rpx;
}

.tip-text {
    flex: 1;
    font-size: 22rpx;
    color: #86868b;
    line-height: 1.5;
}
</style>
