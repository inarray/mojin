/**
 * 午餐方案生成引擎
 * 基于本地模板库生成个性化午餐推荐
 */

import templatesData from '@/data/templates.json'

// 类型定义
export interface Template {
    id: number
    scene: 'takeout' | 'dinein' | 'both'
    mode: 'cheap' | 'light' | 'easy'
    taste: 'all' | 'bland' | 'salty' | 'mild_spicy' | 'spicy'
    budget_level: number
    title: string
    search_keywords: string
    remark_phrases: string[]
    price_range_text: string
    tags: string[]
    avoid_tips: string
}

export interface GenerateParams {
    scene: 'takeout' | 'dinein'
    taste: 'all' | 'bland' | 'salty' | 'mild_spicy' | 'spicy'
    budget: number
    preference: 'normal' | 'light' | 'easy' | 'indulge'
}

export interface PlanResult {
    mode: 'cheap' | 'light' | 'easy'
    modeName: string
    modeDesc: string
    template: Template
    remarkText: string
}

export interface GenerateResult {
    plans: PlanResult[]
    moreList: Template[]
}

// 模式名称映射
const MODE_NAMES: Record<string, { name: string; desc: string }> = {
    cheap: { name: '省钱方案', desc: '预算内最稳' },
    light: { name: '清爽方案', desc: '少油少酱少负担' },
    easy: { name: '省事方案', desc: '闭眼点，省脑' }
}

// 最近使用记录（用于去重）
const RECENT_KEY_PREFIX = 'mj_recent_'
const MAX_RECENT = 5

/**
 * 获取最近使用的模板ID列表
 */
function getRecentIds(mode: string): number[] {
    const key = RECENT_KEY_PREFIX + mode
    const data = uni.getStorageSync(key)
    return data ? JSON.parse(data) : []
}

/**
 * 添加到最近使用
 */
function addToRecent(mode: string, id: number): void {
    const key = RECENT_KEY_PREFIX + mode
    let recent = getRecentIds(mode)
    // 移除已存在的
    recent = recent.filter(i => i !== id)
    // 添加到开头
    recent.unshift(id)
    // 保留最近5条
    recent = recent.slice(0, MAX_RECENT)
    uni.setStorageSync(key, JSON.stringify(recent))
}

/**
 * 清除最近使用记录
 */
export function clearRecentIds(): void {
    ['cheap', 'light', 'easy'].forEach(mode => {
        uni.removeStorageSync(RECENT_KEY_PREFIX + mode)
    })
}

/**
 * 过滤模板
 */
function filterTemplates(
    templates: Template[],
    params: GenerateParams,
    mode: 'cheap' | 'light' | 'easy',
    excludeIds: number[] = []
): Template[] {
    return templates.filter(t => {
        // 排除已使用的
        if (excludeIds.includes(t.id)) return false

        // 场景匹配
        if (t.scene !== 'both' && t.scene !== params.scene) return false

        // 模式匹配
        if (t.mode !== mode) return false

        // 口味匹配：all 不过滤，其他需匹配
        if (params.taste !== 'all' && t.taste !== 'all' && t.taste !== params.taste) {
            return false
        }

        // 预算匹配：省钱方案严格匹配预算，其他可以稍微放宽
        if (mode === 'cheap') {
            if (t.budget_level > params.budget) return false
        } else {
            // 其他模式允许预算上浮20%
            if (t.budget_level > params.budget * 1.2) return false
        }

        return true
    })
}

/**
 * 从数组中随机选择一个
 */
function randomPick<T>(arr: T[]): T | null {
    if (arr.length === 0) return null
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
}

/**
 * 从数组中随机选择多个（不重复）
 */
function randomPickMultiple<T>(arr: T[], count: number): T[] {
    const result: T[] = []
    const copy = [...arr]
    for (let i = 0; i < count && copy.length > 0; i++) {
        const index = Math.floor(Math.random() * copy.length)
        result.push(copy[index])
        copy.splice(index, 1)
    }
    return result
}

/**
 * 生成备注口令文本
 */
function generateRemarkText(phrases: string[]): string {
    if (phrases.length === 0) return ''
    // 随机选择2-3条组合
    const count = Math.min(phrases.length, Math.floor(Math.random() * 2) + 2)
    const selected = randomPickMultiple(phrases, count)
    return selected.join('，')
}

/**
 * 生成单个模式的方案
 */
function generatePlanForMode(
    templates: Template[],
    params: GenerateParams,
    mode: 'cheap' | 'light' | 'easy',
    usedIds: number[]
): PlanResult | null {
    const recentIds = getRecentIds(mode)
    const excludeIds = [...usedIds, ...recentIds]

    let candidates = filterTemplates(templates, params, mode, excludeIds)

    // 如果没有候选，放宽去重限制
    if (candidates.length === 0) {
        candidates = filterTemplates(templates, params, mode, usedIds)
    }

    // 如果还是没有，尝试匹配 both 场景或 all 口味
    if (candidates.length === 0) {
        candidates = templates.filter(t => {
            if (usedIds.includes(t.id)) return false
            if (t.mode !== mode) return false
            if (mode === 'cheap' && t.budget_level > params.budget) return false
            return true
        })
    }

    const template = randomPick(candidates)
    if (!template) return null

    // 记录使用
    addToRecent(mode, template.id)

    return {
        mode,
        modeName: MODE_NAMES[mode].name,
        modeDesc: MODE_NAMES[mode].desc,
        template,
        remarkText: generateRemarkText(template.remark_phrases)
    }
}

/**
 * 主生成函数
 */
export function generatePlans(params: GenerateParams): GenerateResult {
    const templates = templatesData.templates as Template[]
    const usedIds: number[] = []
    const plans: PlanResult[] = []

    // 按顺序生成三套方案
    const modes: Array<'cheap' | 'light' | 'easy'> = ['cheap', 'light', 'easy']

    // 如果用户选择了特定偏好，调整模式顺序
    if (params.preference === 'light') {
        // 清爽优先
        modes.splice(modes.indexOf('light'), 1)
        modes.unshift('light')
    } else if (params.preference === 'easy') {
        // 省事优先
        modes.splice(modes.indexOf('easy'), 1)
        modes.unshift('easy')
    } else if (params.preference === 'indulge') {
        // 放纵一下：调整预算上限
        params.budget = Math.max(params.budget, 35)
    }

    for (const mode of modes) {
        const plan = generatePlanForMode(templates, params, mode, usedIds)
        if (plan) {
            usedIds.push(plan.template.id)
            plans.push(plan)
        }
    }

    // 生成更多推荐列表（10条）
    const allUsedIds = [...usedIds, ...getRecentIds('cheap'), ...getRecentIds('light'), ...getRecentIds('easy')]
    let moreList = templates.filter(t => {
        if (allUsedIds.includes(t.id)) return false
        if (t.scene !== 'both' && t.scene !== params.scene) return false
        if (params.taste !== 'all' && t.taste !== 'all' && t.taste !== params.taste) return false
        if (t.budget_level > params.budget * 1.3) return false
        return true
    })

    moreList = randomPickMultiple(moreList, 10)

    return { plans, moreList }
}

/**
 * 换一批单个方案
 */
export function refreshSinglePlan(
    params: GenerateParams,
    mode: 'cheap' | 'light' | 'easy',
    currentIds: number[]
): PlanResult | null {
    const templates = templatesData.templates as Template[]
    return generatePlanForMode(templates, params, mode, currentIds)
}

/**
 * 换一批更多推荐
 */
export function refreshMoreList(
    params: GenerateParams,
    currentIds: number[]
): Template[] {
    const templates = templatesData.templates as Template[]
    const recentIds = [...getRecentIds('cheap'), ...getRecentIds('light'), ...getRecentIds('easy')]
    const excludeIds = [...currentIds, ...recentIds]

    let candidates = templates.filter(t => {
        if (excludeIds.includes(t.id)) return false
        if (t.scene !== 'both' && t.scene !== params.scene) return false
        if (params.taste !== 'all' && t.taste !== 'all' && t.taste !== params.taste) return false
        if (t.budget_level > params.budget * 1.3) return false
        return true
    })

    return randomPickMultiple(candidates, 10)
}

/**
 * 获取堂食关键词
 */
export function getDineInKeywords(plans: PlanResult[]): string[] {
    const keywords: string[] = []
    const seen = new Set<string>()

    for (const plan of plans) {
        const tags = plan.template.tags
        for (const tag of tags) {
            // 生成 "附近+品类" 格式的关键词
            const keyword = `附近${plan.template.title.replace(/便当|套餐|盖饭|饭$/g, '')}`
            if (!seen.has(keyword)) {
                seen.add(keyword)
                keywords.push(keyword)
            }
        }
    }

    return keywords.slice(0, 3)
}
