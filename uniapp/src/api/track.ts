/**
 * 埋点追踪API
 * 用于无登录场景下的用户行为统计
 */

import request from '@/utils/request'
import { getDeviceId, getCachedChannel } from '@/utils/device'

// 事件类型定义
export type TrackEventType =
    | 'page_view'      // 进入首页
    | 'generate'       // 点击生成
    | 'copy_search'    // 复制搜索词
    | 'copy_remark'    // 复制备注口令
    | 'share'          // 触发分享
    | 'poster_generate' // 生成卡片图片
    | 'refresh_plan'   // 换一批方案
    | 'open_map'       // 打开地图

// 额外参数类型
export interface TrackExtra {
    scene?: 'takeout' | 'dinein'
    taste?: string
    budget?: number
    preference?: string
    mode?: string
    plan_title?: string
    [key: string]: any
}

// 事件队列（用于离线缓存）
const EVENT_QUEUE_KEY = 'mj_track_queue'

/**
 * 获取缓存的事件队列
 */
function getEventQueue(): any[] {
    const data = uni.getStorageSync(EVENT_QUEUE_KEY)
    return data ? JSON.parse(data) : []
}

/**
 * 保存事件到队列
 */
function saveToQueue(event: any): void {
    const queue = getEventQueue()
    queue.push(event)
    // 最多缓存100条
    if (queue.length > 100) {
        queue.shift()
    }
    uni.setStorageSync(EVENT_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * 清空事件队列
 */
function clearEventQueue(): void {
    uni.removeStorageSync(EVENT_QUEUE_KEY)
}

/**
 * 上报单个事件
 */
export async function trackEvent(
    event: TrackEventType,
    extra: TrackExtra = {}
): Promise<boolean> {
    const eventData = {
        event,
        page: 'index',
        channel: getCachedChannel(),
        device_id: getDeviceId(),
        extra,
        timestamp: Date.now()
    }

    try {
        // 尝试发送到服务器
        await request.post('/track/event', eventData)
        return true
    } catch (error) {
        // 发送失败，保存到本地队列
        console.warn('Track event failed, saved to queue:', event)
        saveToQueue(eventData)
        return false
    }
}

/**
 * 批量上报缓存的事件
 */
export async function flushEventQueue(): Promise<void> {
    const queue = getEventQueue()
    if (queue.length === 0) return

    try {
        await request.post('/track/batch', { events: queue })
        clearEventQueue()
    } catch (error) {
        console.warn('Flush event queue failed')
    }
}

/**
 * 页面浏览事件
 */
export function trackPageView(extra: TrackExtra = {}): void {
    trackEvent('page_view', extra)
}

/**
 * 生成方案事件
 */
export function trackGenerate(extra: TrackExtra): void {
    trackEvent('generate', extra)
}

/**
 * 复制搜索词事件
 */
export function trackCopySearch(extra: TrackExtra): void {
    trackEvent('copy_search', extra)
}

/**
 * 复制备注口令事件
 */
export function trackCopyRemark(extra: TrackExtra): void {
    trackEvent('copy_remark', extra)
}

/**
 * 分享事件
 */
export function trackShare(extra: TrackExtra = {}): void {
    trackEvent('share', extra)
}

/**
 * 生成海报事件
 */
export function trackPosterGenerate(extra: TrackExtra = {}): void {
    trackEvent('poster_generate', extra)
}

/**
 * 换一批方案事件
 */
export function trackRefreshPlan(extra: TrackExtra): void {
    trackEvent('refresh_plan', extra)
}

/**
 * 打开地图事件
 */
export function trackOpenMap(extra: TrackExtra): void {
    trackEvent('open_map', extra)
}
