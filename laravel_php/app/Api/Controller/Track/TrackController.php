<?php

namespace App\Api\Controller\Track;

use App\Api\Controller\BaseApiController;
use App\Common\Model\TrackEvent;
use Illuminate\Http\Request;

/**
 * 埋点追踪控制器
 * 用于无登录场景下的用户行为统计
 */
class TrackController extends BaseApiController
{
    // 所有方法都不需要登录
    public array $notNeedLogin = ['event', 'batch'];

    /**
     * 允许的事件类型
     */
    private array $allowedEvents = [
        'page_view',       // 进入首页
        'generate',        // 点击生成
        'copy_search',     // 复制搜索词
        'copy_remark',     // 复制备注口令
        'share',           // 触发分享
        'poster_generate', // 生成卡片图片
        'refresh_plan',    // 换一批方案
        'open_map',        // 打开地图
    ];

    /**
     * 单个事件上报
     * POST /api/track/event
     */
    public function event(Request $request)
    {
        $data = $request->validate([
            'event' => 'required|string|max:32',
            'page' => 'nullable|string|max:32',
            'channel' => 'nullable|string|max:32',
            'device_id' => 'required|string|max:64',
            'extra' => 'nullable|array',
        ]);

        // 验证事件类型
        if (!in_array($data['event'], $this->allowedEvents)) {
            return $this->fail('无效的事件类型');
        }

        try {
            TrackEvent::create([
                'event' => $data['event'],
                'page' => $data['page'] ?? 'index',
                'channel' => $data['channel'] ?? 'direct',
                'device_id' => $data['device_id'],
                'extra' => $data['extra'] ?? null,
                'create_time' => time(),
            ]);

            return $this->success();
        } catch (\Exception $e) {
            return $this->fail('上报失败');
        }
    }

    /**
     * 批量事件上报
     * POST /api/track/batch
     */
    public function batch(Request $request)
    {
        $data = $request->validate([
            'events' => 'required|array|max:100',
            'events.*.event' => 'required|string|max:32',
            'events.*.page' => 'nullable|string|max:32',
            'events.*.channel' => 'nullable|string|max:32',
            'events.*.device_id' => 'required|string|max:64',
            'events.*.extra' => 'nullable|array',
            'events.*.timestamp' => 'nullable|integer',
        ]);

        try {
            $inserts = [];
            $now = time();

            foreach ($data['events'] as $event) {
                // 跳过无效事件类型
                if (!in_array($event['event'], $this->allowedEvents)) {
                    continue;
                }

                $inserts[] = [
                    'event' => $event['event'],
                    'page' => $event['page'] ?? 'index',
                    'channel' => $event['channel'] ?? 'direct',
                    'device_id' => $event['device_id'],
                    'extra' => isset($event['extra']) ? json_encode($event['extra']) : null,
                    'create_time' => isset($event['timestamp']) ? intval($event['timestamp'] / 1000) : $now,
                ];
            }

            if (!empty($inserts)) {
                TrackEvent::insert($inserts);
            }

            return $this->success('上报成功', ['count' => count($inserts)]);
        } catch (\Exception $e) {
            return $this->fail('批量上报失败');
        }
    }
}
