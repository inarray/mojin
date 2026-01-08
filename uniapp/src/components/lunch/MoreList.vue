<template>
    <view class="more-list-container">
        <view class="section-header">
            <text class="section-title">更多推荐</text>
            <view class="refresh-btn" @click="handleRefresh">
                <text class="refresh-icon">🔄</text>
                <text class="refresh-text">换一批</text>
            </view>
        </view>

        <view class="list-wrapper">
            <view
                v-for="item in displayList"
                :key="item.id"
                class="list-item"
            >
                <view class="item-info">
                    <text class="item-title">{{ item.title }}</text>
                    <text class="item-price">{{ item.price_range_text }}</text>
                </view>
                <view class="item-action">
                    <view class="copy-btn" @click="handleCopy(item)">
                        <text class="copy-text">复制搜索词</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="show-more" v-if="hasMore" @click="handleShowMore">
            <text class="show-more-text">展开更多</text>
            <text class="show-more-icon">▼</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Template } from '@/utils/generate'
import { trackCopySearch } from '@/api/track'

const props = defineProps<{
    list: Template[]
}>()

const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'copy', item: Template): void
}>()

const showAll = ref(false)
const displayCount = 5

const displayList = computed(() => {
    if (showAll.value) {
        return props.list
    }
    return props.list.slice(0, displayCount)
})

const hasMore = computed(() => {
    return !showAll.value && props.list.length > displayCount
})

function handleRefresh() {
    showAll.value = false
    emit('refresh')
}

function handleCopy(item: Template) {
    uni.setClipboardData({
        data: item.search_keywords,
        success: () => {
            uni.showToast({
                title: '已复制，去外卖平台粘贴搜索',
                icon: 'none',
                duration: 2000
            })
            // 埋点
            trackCopySearch({
                plan_title: item.title,
                mode: item.mode
            })
        }
    })
    emit('copy', item)
}

function handleShowMore() {
    showAll.value = true
}
</script>

<style lang="scss" scoped>
.more-list-container {
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

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1d1d1f;
}

.refresh-btn {
    display: flex;
    align-items: center;
    padding: 10rpx 18rpx;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 16rpx;

    &:active {
        background: rgba(0, 0, 0, 0.08);
    }
}

.refresh-icon {
    font-size: 20rpx;
    margin-right: 6rpx;
}

.refresh-text {
    font-size: 24rpx;
    color: #86868b;
    font-weight: 500;
}

.list-wrapper {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 14rpx;
    padding: 4rpx 18rpx;
}

.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18rpx 0;
    border-bottom: 0.5rpx solid rgba(0, 0, 0, 0.05);

    &:last-child {
        border-bottom: none;
    }
}

.item-info {
    flex: 1;
}

.item-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #1d1d1f;
    display: block;
    margin-bottom: 4rpx;
}

.item-price {
    font-size: 24rpx;
    color: #86868b;
}

.item-action {
    margin-left: 16rpx;
}

.copy-btn {
    padding: 12rpx 20rpx;
    background: #1d1d1f;
    border-radius: 18rpx;

    &:active {
        opacity: 0.8;
        transform: scale(0.96);
    }
}

.copy-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;
}

.show-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0 8rpx;

    &:active {
        opacity: 0.7;
    }
}

.show-more-text {
    font-size: 26rpx;
    color: #007aff;
    margin-right: 6rpx;
    font-weight: 500;
}

.show-more-icon {
    font-size: 16rpx;
    color: #007aff;
}
</style>
