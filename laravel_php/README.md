# 午餐吃啥外卖 - 后端 API

## 初始化步骤

### 1. 创建 Laravel 项目

```bash
cd /mnt/d/phpstudy_pro/www/wwwroot/mojin/laravel_php
composer create-project laravel/laravel . "11.*"
```

### 2. 配置数据库

编辑 `.env` 文件：

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mojin
DB_USERNAME=root
DB_PASSWORD=your_password
DB_PREFIX=mj_
```

### 3. 创建数据库迁移

创建文件 `database/migrations/xxxx_create_track_event_table.php`：

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('track_event', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 64)->index();
            $table->string('channel', 32)->default('direct')->index();
            $table->string('event', 32)->index();
            $table->string('page', 32)->default('index');
            $table->json('extra')->nullable();
            $table->unsignedInteger('create_time')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('track_event');
    }
};
```

### 4. 运行迁移

```bash
php artisan migrate
```

### 5. 创建埋点控制器

创建文件 `app/Http/Controllers/Api/TrackController.php`：

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrackController extends Controller
{
    /**
     * 单个事件上报
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

        DB::table('track_event')->insert([
            'event' => $data['event'],
            'page' => $data['page'] ?? 'index',
            'channel' => $data['channel'] ?? 'direct',
            'device_id' => $data['device_id'],
            'extra' => isset($data['extra']) ? json_encode($data['extra']) : null,
            'create_time' => time(),
        ]);

        return response()->json([
            'code' => 1,
            'msg' => 'success',
            'data' => null,
        ]);
    }

    /**
     * 批量事件上报
     */
    public function batch(Request $request)
    {
        $data = $request->validate([
            'events' => 'required|array',
            'events.*.event' => 'required|string|max:32',
            'events.*.page' => 'nullable|string|max:32',
            'events.*.channel' => 'nullable|string|max:32',
            'events.*.device_id' => 'required|string|max:64',
            'events.*.extra' => 'nullable|array',
        ]);

        $inserts = [];
        foreach ($data['events'] as $event) {
            $inserts[] = [
                'event' => $event['event'],
                'page' => $event['page'] ?? 'index',
                'channel' => $event['channel'] ?? 'direct',
                'device_id' => $event['device_id'],
                'extra' => isset($event['extra']) ? json_encode($event['extra']) : null,
                'create_time' => time(),
            ];
        }

        DB::table('track_event')->insert($inserts);

        return response()->json([
            'code' => 1,
            'msg' => 'success',
            'data' => null,
        ]);
    }
}
```

### 6. 配置路由

编辑 `routes/api.php`：

```php
<?php

use App\Http\Controllers\Api\TrackController;
use Illuminate\Support\Facades\Route;

Route::prefix('track')->group(function () {
    Route::post('/event', [TrackController::class, 'event']);
    Route::post('/batch', [TrackController::class, 'batch']);
});
```

### 7. 配置 CORS（跨域）

编辑 `config/cors.php`，确保允许小程序域名访问。

### 8. 启动服务

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## API 文档

### POST /api/track/event

单个事件上报。

**请求参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| event | string | 是 | 事件类型 |
| page | string | 否 | 页面名称，默认 index |
| channel | string | 否 | 渠道码，默认 direct |
| device_id | string | 是 | 设备唯一标识 |
| extra | object | 否 | 额外参数 |

**事件类型：**

- `page_view` - 进入首页
- `generate` - 点击生成
- `copy_search` - 复制搜索词
- `copy_remark` - 复制备注口令
- `share` - 触发分享
- `poster_generate` - 生成卡片图片
- `refresh_plan` - 换一批方案
- `open_map` - 打开地图

**响应示例：**

```json
{
    "code": 1,
    "msg": "success",
    "data": null
}
```

### POST /api/track/batch

批量事件上报。

**请求参数：**

```json
{
    "events": [
        {
            "event": "page_view",
            "device_id": "uuid",
            "channel": "direct",
            "extra": {}
        }
    ]
}
```
