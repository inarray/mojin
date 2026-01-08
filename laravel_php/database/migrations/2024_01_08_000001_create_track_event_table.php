<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 埋点事件表
     */
    public function up(): void
    {
        Schema::create('track_event', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 64)->comment('设备唯一标识');
            $table->string('channel', 32)->default('direct')->comment('渠道来源');
            $table->string('event', 32)->comment('事件类型');
            $table->string('page', 32)->default('index')->comment('页面名称');
            $table->json('extra')->nullable()->comment('额外参数');
            $table->unsignedInteger('create_time')->comment('创建时间');

            $table->index('device_id');
            $table->index('channel');
            $table->index('event');
            $table->index('create_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('track_event');
    }
};
