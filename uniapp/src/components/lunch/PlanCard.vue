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
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    border: 0.5rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4rpx 24rpx rgba(100, 150, 200, 0.1);

    &.mode-cheap {
        .card-header {
            background: rgba(52, 199, 89, 0.08);
        }
        .mode-icon-wrap {
            background: rgba(52, 199, 89, 0.12);
        }
        .mode-name {
            color: #34a853;
        }
    }

    &.mode-light {
        .card-header {
            background: rgba(90, 200, 250, 0.08);
        }
        .mode-icon-wrap {
            background: rgba(90, 200, 250, 0.12);
        }
        .mode-name {
            color: #4a9fd4;
        }
    }

    &.mode-easy {
        .card-header {
            background: rgba(255, 179, 64, 0.08);
        }
        .mode-icon-wrap {
            background: rgba(255, 179, 64, 0.12);
        }
        .mode-name {
            color: #d48806;
        }
    }
}

.card-header {
    padding: 18rpx 22rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mode-info {
    display: flex;
    align-items: center;
}

.mode-icon-wrap {
    width: 44rpx;
    height: 44rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12rpx;
}

.mode-icon {
    font-size: 24rpx;
}

.mode-text {
    display: flex;
    flex-direction: column;
}

.mode-name {
    font-size: 26rpx;
    font-weight: 600;
    line-height: 1.3;
}

.mode-desc {
    font-size: 20rpx;
    color: #7a9ab8;
    margin-top: 2rpx;
}

.refresh-btn {
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 14rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);

    &:active {
        background: rgba(255, 255, 255, 0.7);
    }
}

.refresh-text {
    font-size: 22rpx;
    color: #7a9ab8;
}

.card-body {
    padding: 18rpx 22rpx;
}

.dish-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 12rpx;
}

.dish-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #2c3e50;
    flex: 1;
}

.price-range {
    font-size: 24rpx;
    font-weight: 500;
    color: #7a9ab8;
    margin-left: 16rpx;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 18rpx;
}

.tag-item {
    font-size: 20rpx;
    color: #7a9ab8;
    background: rgba(255, 255, 255, 0.5);
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);
}

.actions-area {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16rpx;
    padding: 4rpx;
    margin-bottom: 14rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.5);
}

.action-item {
    padding: 14rpx;
    border-bottom: 0.5rpx solid rgba(255, 255, 255, 0.5);

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
    width: 26rpx;
    height: 26rpx;
    background: #5a8ec0;
    color: #fff;
    font-size: 16rpx;
    font-weight: 600;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10rpx;
}

.label-text {
    font-size: 22rpx;
    color: #7a9ab8;
}

.action-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.7);
    padding: 14rpx 16rpx;
    border-radius: 12rpx;
}

.content-value {
    flex: 1;
    font-size: 26rpx;
    color: #2c3e50;
    font-weight: 500;

    &.remark {
        font-size: 24rpx;
        color: #4a6580;
        font-weight: normal;
    }
}

.copy-btn {
    display: flex;
    align-items: center;
    background: #5a8ec0;
    padding: 12rpx 22rpx;
    border-radius: 18rpx;
    margin-left: 12rpx;

    &:active {
        opacity: 0.85;
        transform: scale(0.96);
    }

    &.secondary {
        background: rgba(255, 255, 255, 0.6);
        border: 0.5rpx solid rgba(255, 255, 255, 0.8);

        .copy-text {
            color: #5a8ec0;
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
    padding: 12rpx 16rpx;
    background: rgba(255, 220, 100, 0.15);
    border-radius: 12rpx;
}

.tip-icon {
    font-size: 20rpx;
    margin-right: 8rpx;
    margin-top: 2rpx;
}

.tip-text {
    flex: 1;
    font-size: 22rpx;
    color: #8a7a55;
    line-height: 1.5;
}
</style>
