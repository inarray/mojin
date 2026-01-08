/**
 * 设备ID管理工具
 * 用于生成和管理唯一设备标识，支持无登录场景下的用户追踪
 */

const DEVICE_ID_KEY = 'mj_device_id'

/**
 * 生成UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

/**
 * 获取设备ID
 * 如果本地没有则生成新的并缓存
 */
export function getDeviceId(): string {
    let deviceId = uni.getStorageSync(DEVICE_ID_KEY)
    if (!deviceId) {
        deviceId = generateUUID()
        uni.setStorageSync(DEVICE_ID_KEY, deviceId)
    }
    return deviceId
}

/**
 * 清除设备ID（一般不需要调用）
 */
export function clearDeviceId(): void {
    uni.removeStorageSync(DEVICE_ID_KEY)
}

/**
 * 获取渠道码
 * 从页面参数中解析，没有则返回 'direct'
 */
export function getChannel(): string {
    const pages = getCurrentPages()
    if (pages.length > 0) {
        const currentPage = pages[pages.length - 1] as any
        const options = currentPage.options || {}
        return options.c || 'direct'
    }
    return 'direct'
}

/**
 * 缓存渠道码到本地（用于后续事件上报）
 */
const CHANNEL_KEY = 'mj_channel'

export function setChannel(channel: string): void {
    if (channel && channel !== 'direct') {
        uni.setStorageSync(CHANNEL_KEY, channel)
    }
}

export function getCachedChannel(): string {
    return uni.getStorageSync(CHANNEL_KEY) || 'direct'
}
