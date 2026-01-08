<template>
    <view class="chips-container">
        <view class="chips-title" v-if="title">{{ title }}</view>
        <view class="chips-list">
            <view
                v-for="item in options"
                :key="item.value"
                class="chip-item"
                :class="{ active: modelValue === item.value }"
                @click="handleSelect(item.value)"
            >
                <text class="chip-text">{{ item.label }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
interface ChipOption {
    label: string
    value: string | number
}

const props = defineProps<{
    title?: string
    options: ChipOption[]
    modelValue: string | number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void
}>()

function handleSelect(value: string | number) {
    emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
.chips-container {
    margin-bottom: 32rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.chips-title {
    font-size: 26rpx;
    font-weight: 500;
    color: #86868b;
    margin-bottom: 16rpx;
}

.chips-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.chip-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx 28rpx;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 20rpx;
    transition: all 0.3s ease;

    &.active {
        background: #fff;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08), 0 1rpx 3rpx rgba(0, 0, 0, 0.06);

        .chip-text {
            color: #1d1d1f;
            font-weight: 600;
        }
    }

    &:not(.active):active {
        transform: scale(0.96);
    }
}

.chip-text {
    font-size: 26rpx;
    color: #86868b;
    white-space: nowrap;
}
</style>
