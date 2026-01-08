<?php

use App\Api\Controller\Track\TrackController;
use Illuminate\Support\Facades\Route;

/**
 * 埋点追踪路由
 * 不需要登录验证
 */
Route::controller(TrackController::class)->prefix('track')->group(function () {
    Route::post('event', 'event');   // 单个事件上报
    Route::post('batch', 'batch');   // 批量事件上报
});
