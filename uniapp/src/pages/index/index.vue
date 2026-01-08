<template>
    <view class="lunch-page">
        <!-- 顶部栏 -->
        <view class="top-bar">
            <view class="logo-area">
                <image class="logo" src="/static/logo.jpg" mode="aspectFit" />
                <text class="app-name">午餐吃啥</text>
            </view>
            <view class="location-area" @click="handleLocation">
                <text class="location-icon">📍</text>
                <text class="location-text">{{ location || '定位中...' }}</text>
            </view>
        </view>

        <!-- 场景切换 -->
        <view class="scene-tabs">
            <view
                class="scene-tab"
                :class="{ active: params.scene === 'takeout' }"
                @click="params.scene = 'takeout'"
            >
                <text class="tab-icon">🛵</text>
                <text class="tab-text">外卖</text>
            </view>
            <view
                class="scene-tab"
                :class="{ active: params.scene === 'dinein' }"
                @click="params.scene = 'dinein'"
            >
                <text class="tab-icon">🍽️</text>
                <text class="tab-text">堂食</text>
            </view>
        </view>

        <!-- 条件选择区 -->
        <view class="selection-area">
            <!-- 口味选择 -->
            <Chips
                title="今天想吃的口味"
                :options="tasteOptions"
                v-model="params.taste"
            />

            <!-- 预算选择 -->
            <Chips
                title="预算"
                :options="budgetOptions"
                v-model="params.budget"
            />

            <!-- 偏好选择 -->
            <Chips
                title="今天想吃得..."
                :options="preferenceOptions"
                v-model="params.preference"
            />
        </view>

        <!-- 结果区域 -->
        <view class="result-area" v-if="showResult" id="resultArea">
            <!-- 三套方案卡片 -->
            <view class="plans-section">
                <view class="section-title-row">
                    <text class="section-icon">✨</text>
                    <text class="section-title">为你生成的3套方案</text>
                </view>
                <PlanCard
                    v-for="plan in result.plans"
                    :key="plan.mode"
                    :plan="plan"
                    @refresh="handleRefreshPlan"
                />
                <!-- 使用提示 -->
                <view class="usage-tip">
                    <text class="tip-icon">💡</text>
                    <text class="tip-content">复制搜索词 → 去外卖平台搜索；复制备注 → 下单时粘贴到备注栏</text>
                </view>
            </view>

            <!-- 堂食导航（仅堂食模式） -->
            <DineInNav
                v-if="params.scene === 'dinein'"
                :keywords="dineInKeywords"
            />

            <!-- 更多推荐 -->
            <MoreList
                :list="result.moreList"
                @refresh="handleRefreshMore"
            />

            <!-- 免责声明 -->
            <view class="disclaimer">
                建议仅供参考，具体以商家实际为准。
            </view>
        </view>

        <!-- 底部浮动按钮 -->
        <view class="fab-container">
            <view class="fab-btn" :class="{ 'is-regenerate': showResult }" @click="handleGenerate" v-if="!isGenerating">
                <text class="fab-icon">{{ showResult ? '🔄' : '✨' }}</text>
            </view>
            <view class="fab-btn loading" v-else>
                <view class="loading-spinner"></view>
            </view>
            <text class="fab-label">{{ showResult ? '重新生成' : '生成方案' }}</text>

            <view class="share-fab" v-if="showResult" @click="handleGeneratePoster">
                <text class="share-icon">📤</text>
            </view>
        </view>

        <!-- 海报生成 Canvas（隐藏） -->
        <canvas
            canvas-id="posterCanvas"
            id="posterCanvas"
            class="poster-canvas"
            :style="{ width: '750rpx', height: '750rpx' }"
        />
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShareAppMessage, onShow } from '@dcloudio/uni-app'
import Chips from '@/components/lunch/Chips.vue'
import PlanCard from '@/components/lunch/PlanCard.vue'
import MoreList from '@/components/lunch/MoreList.vue'
import DineInNav from '@/components/lunch/DineInNav.vue'
import {
    generatePlans,
    refreshSinglePlan,
    refreshMoreList,
    getDineInKeywords,
    type GenerateParams,
    type GenerateResult,
    type PlanResult
} from '@/utils/generate'
import { getDeviceId, setChannel, getCachedChannel } from '@/utils/device'
import {
    trackPageView,
    trackGenerate,
    trackShare,
    trackPosterGenerate,
    flushEventQueue
} from '@/api/track'

// 选项配置
const tasteOptions = [
    { label: '都行', value: 'all' },
    { label: '淡口', value: 'bland' },
    { label: '偏咸', value: 'salty' },
    { label: '微辣', value: 'mild_spicy' },
    { label: '重辣', value: 'spicy' }
]

const budgetOptions = [
    { label: '¥15', value: 15 },
    { label: '¥20', value: 20 },
    { label: '¥25', value: 25 },
    { label: '¥30', value: 30 },
    { label: '¥35+', value: 35 }
]

const preferenceOptions = [
    { label: '正常', value: 'normal' },
    { label: '清爽少负担', value: 'light' },
    { label: '省事不费脑', value: 'easy' },
    { label: '放纵一下', value: 'indulge' }
]

// 状态
const params = reactive<GenerateParams>({
    scene: 'takeout',
    taste: 'all',
    budget: 15,
    preference: 'normal'
})

const result = reactive<GenerateResult>({
    plans: [],
    moreList: []
})

const location = ref<string>('')
const showResult = ref(false)
const isGenerating = ref(false)

// 堂食关键词
const dineInKeywords = computed(() => {
    if (params.scene !== 'dinein' || result.plans.length === 0) {
        return []
    }
    return getDineInKeywords(result.plans)
})

// 获取当前所有方案的ID
const currentPlanIds = computed(() => {
    return result.plans.map(p => p.template.id)
})

// 获取定位
function handleLocation() {
    uni.getLocation({
        type: 'gcj02',
        success: (res) => {
            // 逆地理编码获取城市（简化处理，实际可调用接口）
            location.value = '定位成功'
            // 可以调用地图API获取城市名
        },
        fail: () => {
            location.value = '未开启定位'
        }
    })
}

// 生成方案
async function handleGenerate() {
    isGenerating.value = true

    // 模拟思考时间
    const delay = 600 + Math.random() * 600
    await new Promise(resolve => setTimeout(resolve, delay))

    // 生成方案
    const genResult = generatePlans(params)
    result.plans = genResult.plans
    result.moreList = genResult.moreList

    showResult.value = true
    isGenerating.value = false

    // 埋点
    trackGenerate({
        scene: params.scene,
        taste: params.taste,
        budget: params.budget,
        preference: params.preference
    })

    // 滚动到结果区域
    setTimeout(() => {
        uni.createSelectorQuery()
            .select('#resultArea')
            .boundingClientRect((rect: any) => {
                if (rect) {
                    uni.pageScrollTo({
                        scrollTop: rect.top - 20,
                        duration: 300
                    })
                }
            })
            .exec()
    }, 100)
}

// 换一个方案
function handleRefreshPlan(mode: string) {
    const newPlan = refreshSinglePlan(
        params,
        mode as 'cheap' | 'light' | 'easy',
        currentPlanIds.value
    )
    if (newPlan) {
        const index = result.plans.findIndex(p => p.mode === mode)
        if (index !== -1) {
            result.plans[index] = newPlan
        }
    }
}

// 换一批更多推荐
function handleRefreshMore() {
    const moreIds = result.moreList.map(t => t.id)
    result.moreList = refreshMoreList(params, [...currentPlanIds.value, ...moreIds])
}

// 生成海报卡片
function handleGeneratePoster() {
    trackPosterGenerate({
        scene: params.scene,
        budget: params.budget
    })

    const ctx = uni.createCanvasContext('posterCanvas')
    const width = 375
    const height = 375

    // 背景
    ctx.setFillStyle('#FFF8F0')
    ctx.fillRect(0, 0, width, height)

    // 标题
    ctx.setFillStyle('#333')
    ctx.setFontSize(18)
    ctx.setTextAlign('center')
    ctx.fillText('今日午餐方案', width / 2, 35)

    // 三套方案
    let y = 60
    result.plans.forEach((plan, index) => {
        // 方案名
        ctx.setFillStyle('#FF6B35')
        ctx.setFontSize(14)
        ctx.setTextAlign('left')
        ctx.fillText(`${plan.modeName}`, 20, y)

        // 菜品名
        ctx.setFillStyle('#333')
        ctx.setFontSize(16)
        ctx.fillText(plan.template.title, 100, y)

        // 价格
        ctx.setFillStyle('#999')
        ctx.setFontSize(12)
        ctx.fillText(plan.template.price_range_text, 280, y)

        y += 35

        // 搜索词
        ctx.setFillStyle('#666')
        ctx.setFontSize(12)
        ctx.fillText(`搜: ${plan.template.search_keywords}`, 30, y)

        y += 45
    })

    // 底部提示
    ctx.setFillStyle('#999')
    ctx.setFontSize(11)
    ctx.setTextAlign('center')
    ctx.fillText('打开小程序：午餐吃啥外卖', width / 2, height - 40)
    ctx.fillText('一键生成同款方案', width / 2, height - 22)

    ctx.draw(false, () => {
        setTimeout(() => {
            uni.canvasToTempFilePath({
                canvasId: 'posterCanvas',
                success: (res) => {
                    // 保存到相册
                    uni.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            uni.showToast({
                                title: '已保存到相册，快去分享吧！',
                                icon: 'none',
                                duration: 2500
                            })
                        },
                        fail: () => {
                            // 尝试分享
                            uni.showToast({
                                title: '保存失败，请授权相册权限',
                                icon: 'none'
                            })
                        }
                    })
                },
                fail: (err) => {
                    console.error('生成海报失败', err)
                    uni.showToast({
                        title: '生成失败，请重试',
                        icon: 'none'
                    })
                }
            })
        }, 200)
    })
}

// 分享配置
onShareAppMessage(() => {
    // 埋点
    trackShare({
        scene: params.scene,
        budget: params.budget
    })

    // 分享标题模板
    const titles = [
        '午餐吃啥？我10秒生成了3套方案',
        `预算${params.budget}也能吃得爽：直接抄这个点单口令`,
        '外卖怎么点不踩雷？复制口令就行',
        '同事都在用的午餐决策神器',
        '选择困难症福音：3套午餐方案任你选'
    ]
    const title = titles[Math.floor(Math.random() * titles.length)]

    // 分享路径
    const channel = getCachedChannel()
    const path = `/pages/index/index?c=${channel}&from=share&scene=${params.scene}&budget=${params.budget}&taste=${params.taste}&pref=${params.preference}`

    return {
        title,
        path,
        imageUrl: '/static/share-cover.png'
    }
})

// 页面加载
onLoad((options: any) => {
    // 解析分享参数
    if (options) {
        if (options.c) {
            setChannel(options.c)
        }
        if (options.scene) {
            params.scene = options.scene as 'takeout' | 'dinein'
        }
        if (options.budget) {
            params.budget = parseInt(options.budget) || 20
        }
        if (options.taste) {
            params.taste = options.taste
        }
        if (options.pref) {
            params.preference = options.pref
        }
    }

    // 初始化设备ID
    getDeviceId()

    // 尝试获取定位
    handleLocation()
})

onShow(() => {
    // 页面浏览埋点
    trackPageView({
        scene: params.scene
    })

    // 尝试上报缓存的事件
    flushEventQueue()
})

onMounted(() => {
    // 设置页面标题
    uni.setNavigationBarTitle({
        title: '午餐吃啥'
    })
})
</script>

<style lang="scss" scoped>
.lunch-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #e8f4fc 0%, #dce8f5 50%, #e5eef8 100%);
    padding-bottom: 280rpx;
}

// 顶部栏
.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 28rpx;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    border-bottom: 0.5rpx solid rgba(255, 255, 255, 0.5);
}

.logo-area {
    display: flex;
    align-items: center;
}

.logo {
    width: 56rpx;
    height: 56rpx;
    border-radius: 14rpx;
    margin-right: 12rpx;
}

.app-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.5rpx;
}

.location-area {
    display: flex;
    align-items: center;
    padding: 10rpx 18rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 18rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.8);
}

.location-icon {
    font-size: 20rpx;
    margin-right: 6rpx;
}

.location-text {
    font-size: 24rpx;
    color: #5a7a9a;
}

// 场景切换
.scene-tabs {
    display: flex;
    padding: 16rpx 28rpx 20rpx;
    gap: 16rpx;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
}

.scene-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22rpx;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 16rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;

    &.active {
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 4rpx 16rpx rgba(100, 150, 200, 0.15);
        border-color: rgba(255, 255, 255, 0.9);

        .tab-text {
            color: #2c3e50;
            font-weight: 600;
        }
    }

    &:not(.active):active {
        transform: scale(0.97);
        background: rgba(255, 255, 255, 0.5);
    }
}

.tab-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
}

.tab-text {
    font-size: 28rpx;
    color: #7a9ab8;
    font-weight: 500;
}

// 条件选择区
.selection-area {
    margin: 20rpx;
    padding: 28rpx;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    border-radius: 24rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4rpx 24rpx rgba(100, 150, 200, 0.1);
}

// 结果区域
.result-area {
    padding: 0 20rpx;
}

.plans-section {
    margin-bottom: 20rpx;
}

.section-title-row {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 0 8rpx;
}

.section-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
}

.section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2c3e50;
}

.usage-tip {
    display: flex;
    align-items: flex-start;
    padding: 18rpx 22rpx;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    border: 0.5rpx solid rgba(255, 255, 255, 0.6);
}

.tip-icon {
    font-size: 20rpx;
    margin-right: 10rpx;
    margin-top: 2rpx;
}

.tip-content {
    flex: 1;
    font-size: 24rpx;
    color: #7a9ab8;
    line-height: 1.6;
}

.disclaimer {
    text-align: center;
    font-size: 22rpx;
    color: #9ab5cc;
    padding: 40rpx 0;
}

// 底部浮动按钮
.fab-container {
    position: fixed;
    bottom: calc(80rpx + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 100;
}

.fab-btn {
    width: 116rpx;
    height: 116rpx;
    border-radius: 58rpx;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    box-shadow: 0 6rpx 32rpx rgba(100, 150, 200, 0.25),
                0 2rpx 8rpx rgba(100, 150, 200, 0.1),
                inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
    border: 0.5rpx solid rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.92);
        box-shadow: 0 2rpx 16rpx rgba(100, 150, 200, 0.2);
    }

    &.is-regenerate {
        background: rgba(255, 255, 255, 0.75);
    }

    &.loading {
        opacity: 0.85;
    }
}

.fab-icon {
    font-size: 44rpx;
}

.fab-label {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #7a9ab8;
    font-weight: 500;
}

.share-fab {
    position: absolute;
    right: -90rpx;
    top: 16rpx;
    width: 72rpx;
    height: 72rpx;
    border-radius: 36rpx;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: saturate(180%) blur(40px);
    -webkit-backdrop-filter: saturate(180%) blur(40px);
    box-shadow: 0 4rpx 20rpx rgba(100, 150, 200, 0.2),
                inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
    border: 0.5rpx solid rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
        transform: scale(0.92);
    }
}

.share-icon {
    font-size: 32rpx;
}

.loading-spinner {
    width: 36rpx;
    height: 36rpx;
    border: 3rpx solid rgba(100, 150, 200, 0.2);
    border-top-color: #5a8ec0;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

// 海报 Canvas（隐藏）
.poster-canvas {
    position: fixed;
    left: -9999rpx;
    top: -9999rpx;
}
</style>
