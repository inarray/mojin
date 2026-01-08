<?php

namespace App\Common\Model;

/**
 * 埋点事件模型
 */
class TrackEvent extends BaseModel
{
    protected $table = 'track_event';

    // 不需要 updated_at
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = [
        'extra' => 'array',
        'create_time' => 'datetime:Y-m-d H:i:s',
    ];

    public function getUpdatedAtColumn()
    {
        return null;
    }
}
