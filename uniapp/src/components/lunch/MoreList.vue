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
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    border-radius: 24rpx;
    padding: 22rpx;
    margin-bottom: 20rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4rpx 24rpx rgba(100, 150, 200, 0.1);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2c3e50;
}

.refresh-btn {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 14rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);

    &:active {
        background: rgba(255, 255, 255, 0.7);
    }
}

.refresh-icon {
    font-size: 18rpx;
    margin-right: 6rpx;
}

.refresh-text {
    font-size: 22rpx;
    color: #7a9ab8;
    font-weight: 500;
}

.list-wrapper {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16rpx;
    padding: 4rpx 16rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.5);
}

.list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
    border-bottom: 0.5rpx solid rgba(255, 255, 255, 0.5);

    &:last-child {
        border-bottom: none;
    }
}

.item-info {
    flex: 1;
}

.item-title {
    font-size: 26rpx;
    font-weight: 500;
    color: #2c3e50;
    display: block;
    margin-bottom: 4rpx;
}

.item-price {
    font-size: 22rpx;
    color: #7a9ab8;
}

.item-action {
    margin-left: 14rpx;
}

.copy-btn {
    padding: 10rpx 18rpx;
    background: #5a8ec0;
    border-radius: 16rpx;

    &:active {
        opacity: 0.85;
        transform: scale(0.96);
    }
}

.copy-text {
    font-size: 22rpx;
    color: #fff;
    font-weight: 500;
}

.show-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18rpx 0 8rpx;

    &:active {
        opacity: 0.7;
    }
}

.show-more-text {
    font-size: 24rpx;
    color: #5a8ec0;
    margin-right: 6rpx;
    font-weight: 500;
}

.show-more-icon {
    font-size: 14rpx;
    color: #5a8ec0;
}
</style>
