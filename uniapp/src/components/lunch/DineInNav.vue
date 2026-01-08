<template>
    <view class="dinein-nav-container">
        <view class="section-header">
            <view class="header-left">
                <text class="section-icon">📍</text>
                <text class="section-title">附近就餐</text>
            </view>
            <text class="section-desc">轻量版</text>
        </view>

        <view class="keywords-list">
            <view
                v-for="(keyword, index) in keywords"
                :key="index"
                class="keyword-card"
            >
                <text class="keyword-text">{{ keyword }}</text>
                <view class="keyword-actions">
                    <view class="action-btn copy" @click="handleCopy(keyword)">
                        <text class="btn-text">复制</text>
                    </view>
                    <view class="action-btn map" @click="handleOpenMap(keyword)">
                        <text class="btn-icon">🗺️</text>
                        <text class="btn-text">地图</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="tip-row">
            <text class="tip-icon">💡</text>
            <text class="tip-text">复制关键词到地图APP搜索，或点击"地图"直接打开</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { trackCopySearch, trackOpenMap } from '@/api/track'

const props = defineProps<{
    keywords: string[]
}>()

// 复制关键词
function handleCopy(keyword: string) {
    uni.setClipboardData({
        data: keyword,
        success: () => {
            uni.showToast({
                title: '已复制，去地图APP粘贴搜索',
                icon: 'none',
                duration: 2000
            })
            // 埋点
            trackCopySearch({
                scene: 'dinein',
                plan_title: keyword
            })
        }
    })
}

// 打开地图
function handleOpenMap(keyword: string) {
    // 获取当前位置
    uni.getLocation({
        type: 'gcj02',
        success: (res) => {
            // 打开地图选择位置
            uni.openLocation({
                latitude: res.latitude,
                longitude: res.longitude,
                name: keyword,
                scale: 15,
                fail: () => {
                    // 如果打开失败，提示用户手动搜索
                    uni.showToast({
                        title: '请在地图APP中搜索：' + keyword,
                        icon: 'none',
                        duration: 2500
                    })
                }
            })
            // 埋点
            trackOpenMap({
                scene: 'dinein',
                plan_title: keyword
            })
        },
        fail: () => {
            // 定位失败，复制关键词
            uni.setClipboardData({
                data: keyword,
                success: () => {
                    uni.showToast({
                        title: '定位失败，已复制关键词，请手动搜索',
                        icon: 'none',
                        duration: 2500
                    })
                }
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.dinein-nav-container {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
}

.header-left {
    display: flex;
    align-items: center;
}

.section-icon {
    font-size: 26rpx;
    margin-right: 8rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1d1d1f;
}

.section-desc {
    font-size: 22rpx;
    color: #86868b;
    background: rgba(0, 0, 0, 0.04);
    padding: 6rpx 14rpx;
    border-radius: 10rpx;
}

.keywords-list {
    margin-bottom: 16rpx;
}

.keyword-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 14rpx;
    margin-bottom: 12rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.keyword-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #1d1d1f;
}

.keyword-actions {
    display: flex;
    gap: 10rpx;
}

.action-btn {
    display: flex;
    align-items: center;
    padding: 10rpx 18rpx;
    border-radius: 18rpx;

    &.copy {
        background: rgba(0, 0, 0, 0.04);

        .btn-text {
            color: #86868b;
        }
    }

    &.map {
        background: #34c759;

        .btn-icon {
            margin-right: 4rpx;
        }

        .btn-text {
            color: #fff;
        }
    }

    &:active {
        opacity: 0.8;
        transform: scale(0.96);
    }
}

.btn-icon {
    font-size: 20rpx;
}

.btn-text {
    font-size: 24rpx;
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
    font-size: 20rpx;
    margin-right: 8rpx;
    margin-top: 2rpx;
}

.tip-text {
    flex: 1;
    font-size: 22rpx;
    color: #86868b;
    line-height: 1.5;
}
</style>
