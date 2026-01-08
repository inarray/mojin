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
    margin-bottom: 28rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.chips-title {
    font-size: 24rpx;
    font-weight: 500;
    color: #7a9ab8;
    margin-bottom: 14rpx;
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
    padding: 14rpx 26rpx;
    background: rgba(255, 255, 255, 0.45);
    border-radius: 32rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &.active {
        background: rgba(255, 255, 255, 0.85);
        border-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 4rpx 20rpx rgba(100, 150, 200, 0.2),
                    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);

        .chip-text {
            color: #2c3e50;
            font-weight: 600;
        }
    }

    &:not(.active):active {
        transform: scale(0.96);
        background: rgba(255, 255, 255, 0.55);
    }
}

.chip-text {
    font-size: 26rpx;
    color: #6a8caa;
    white-space: nowrap;
    font-weight: 500;
}
</style>
