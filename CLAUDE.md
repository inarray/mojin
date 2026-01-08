# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供项目开发指引。

## 项目概述

**午餐吃啥外卖** - 午餐外卖决策助手小程序：

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| **laravel_php/** | Laravel 11 + likeadmin | 后端 API 服务 |
| **admin/** | Vue 3 + Element Plus + likeadmin | 后台管理前端 |
| **uniapp/** | Uni-app + Vue 3 | 微信小程序 |

### 产品定位

- **核心功能**：10秒生成"省钱/清爽/省事"三套午餐点单方案
- **输出内容**：可复制的"搜索词/备注口令"
- **场景支持**：外卖（默认）、堂食
- **堂食一期**：附近餐饮列表 + 导航（可选）

## 沟通规范

- 所有对话和回复一律使用中文
- 如果涉及新增后端目录或新增菜单，需要在回复中提供对应的菜单配置说明

## 业务模块

### 后台管理系统（admin/）

| 模块 | 功能 |
|------|------|
| 用户管理 | 小程序用户信息、使用记录 |
| 方案配置 | 午餐方案模板、关键词配置 |
| 餐饮数据 | 餐饮店铺、菜品数据管理 |
| 系统设置 | 权限管理、数据字典、应用配置 |

### 小程序端（uniapp/）

| 功能 | 说明 |
|------|------|
| 首页 | 快速生成午餐方案入口 |
| 方案生成 | 省钱/清爽/省事三套方案 |
| 堂食导航 | 附近餐饮列表、地图导航 |
| 个人中心 | 历史记录、收藏、设置 |

## 常用命令

### 后端（laravel_php/）

```bash
# 开发环境
composer run dev                # 开发服务器（热重载）
php artisan serve              # 单独运行开发服务器
php artisan queue:listen       # 队列处理

# 测试（PEST 框架）
vendor/bin/pest                # 运行所有测试
vendor/bin/pest tests/Unit     # 单元测试
vendor/bin/pest tests/Feature  # 功能测试

# 数据库
php artisan migrate            # 执行迁移
php artisan migrate:fresh      # 重置并重新执行所有迁移

# 生产构建
npm run build                  # 构建前端资源
php artisan storage:link       # 创建存储链接
```

### 后台前端（admin/）

```bash
npm install                    # 安装依赖
npm run dev                    # 开发模式（热重载）
npm run build                  # 生产构建（输出到 laravel_php/public/admin/）
npm run lint                   # ESLint 代码检查
npm run type-check             # TypeScript 类型检查
```

### 小程序（uniapp/）

```bash
npm install                    # 安装依赖
npm run dev:mp-weixin          # 开发模式（微信小程序）
npm run build:mp-weixin        # 生产构建（微信小程序）
npm run dev:h5                 # H5 开发模式
npm run build:h5               # H5 生产构建
```

## 架构设计

### 后台前端目录结构（admin/）

likeadmin Vue3 前端工程，采用标准分层架构：

```
admin/src/
├── api/                   # 接口定义（按模块分类）
│   ├── perms/             # 权限管理（admin, role, menu）
│   ├── org/               # 组织架构（department, post）
│   ├── setting/           # 系统设置
│   ├── channel/           # 渠道管理
│   └── user.ts            # 用户相关
├── views/                 # 页面视图（与 api 对应）
│   ├── permission/        # 权限管理页面
│   ├── organization/      # 组织架构页面
│   ├── setting/           # 设置页面
│   ├── decoration/        # 装修管理
│   └── account/           # 登录页
├── components/            # 公共组件
│   ├── editor/            # 富文本编辑器
│   ├── material/          # 素材选择器
│   ├── upload/            # 上传组件
│   └── pagination/        # 分页组件
├── stores/modules/        # Pinia 状态管理
│   ├── user.ts            # 用户状态、登录逻辑
│   ├── app.ts             # 应用状态
│   └── setting.ts         # 设置状态
├── router/                # 路由配置
├── hooks/                 # 组合式函数
│   ├── usePaging.ts       # 分页逻辑
│   └── useDictOptions.ts  # 字典数据
├── utils/                 # 工具函数
│   ├── request/           # Axios 封装
│   └── auth.ts            # 认证工具
├── config/                # 配置
│   └── index.ts           # baseUrl, urlPrefix: 'adminapi'
├── permission.ts          # 路由守卫、权限控制
└── styles/                # 样式文件
```

### 后端目录结构（laravel_php/）

后端采用按 API 上下文划分的模块化分层架构：

```
app/
├── Adminapi/              # 后台管理接口
│   ├── Controller/        # 控制器（路由处理）
│   │   ├── User/          # 用户管理模块
│   │   ├── Lunch/         # 午餐方案模块
│   │   ├── Restaurant/    # 餐饮数据模块
│   │   └── Setting/       # 系统设置模块
│   ├── Logic/             # 业务逻辑层
│   ├── Lists/             # 分页/筛选查询
│   ├── Validate/          # 请求验证
│   ├── Middleware/        # 中间件链：Init → Login → Auth → OperationLog
│   └── Route/             # 路由定义
├── Api/                   # 小程序接口（结构同 Adminapi）
│   ├── Controller/
│   │   ├── Lunch/         # 午餐方案生成
│   │   ├── Restaurant/    # 附近餐饮
│   │   └── User/          # 用户相关
│   └── Route/
├── Common/                # 公共代码
│   ├── Controller/        # BaseLikeAdminController 基类
│   ├── Model/             # 数据模型
│   ├── Service/           # JsonService 等公共服务
│   ├── Enum/              # 枚举定义
│   └── common.php         # 辅助函数（自动加载）
└── Models/                # Laravel 原生模型
```

### 小程序目录结构（uniapp/）

```
uniapp/src/
├── api/                   # 接口定义
│   ├── lunch.ts           # 午餐方案接口
│   ├── restaurant.ts      # 餐饮数据接口
│   └── user.ts            # 用户接口
├── pages/                 # 主包页面
│   ├── index/             # 首页
│   ├── lunch/             # 方案生成页
│   ├── restaurant/        # 餐饮列表/详情
│   └── user/              # 个人中心
├── packages/              # 分包页面
│   └── pages/
├── components/            # 公共组件
│   ├── widgets/           # 装修组件
│   └── ...
├── stores/                # Pinia 状态管理
│   └── user.ts            # 用户状态
├── utils/                 # 工具函数
│   ├── request/           # 请求封装
│   └── auth.ts            # 认证工具
├── config/                # 配置
│   └── index.ts           # baseUrl, urlPrefix: 'api'
├── enums/                 # 枚举定义
├── hooks/                 # 组合式函数
└── pages.json             # 路由配置
```

### 路由注册

路由在 `bootstrap/app.php` 中注册：
- `/adminapi/*` → `app/Adminapi/Route/index.php`（带完整认证中间件链）
- `/api/*` → `app/Api/Route/index.php`（简化认证）
- `/` → `routes/web.php`

### 响应格式

所有 API 响应使用 `JsonService`：
```php
JsonService::success($msg, $data, $code);  // code=1，成功
JsonService::fail($msg, $data, $code);     // code=0，失败
JsonService::data($data);                   // 返回原始数据
JsonService::dataLists($data);             // 返回分页列表
```

### 中间件链（Adminapi）

1. `InitMiddleware` - 请求初始化
2. `LoginMiddleware` - Token 验证
3. `AuthMiddleware` - 权限检查
4. `OperationLogMiddleware` - 操作日志记录

### 前端请求封装

**后台前端（admin/）** - `src/config/index.ts`：
```typescript
{
    terminal: 1,              // 终端标识
    baseUrl: '/adminapi',     // 接口前缀
    timeout: 10 * 1000        // 超时时间
}
```

**小程序端（uniapp/）** - `src/config/index.ts`：
```typescript
{
    baseUrl: 'https://mojin.cloud/',  // 接口域名
    urlPrefix: 'api',                  // 接口前缀
    timeout: 60 * 1000                 // 超时时间
}
```

请求处理：
- 自动添加 `token` 到 Header
- 响应码处理：`code=1` 成功，`code=0` 失败，`code=-1` 登录失效
- 支持请求重试、取消重复请求

### 控制器模式

控制器继承 `BaseLikeAdminController`，提供：
- 通过 `Validate` 类自动验证
- 使用 Lists 类的标准 CRUD 操作和分页
- 基于 Token 的认证（通过请求属性）

### 关键文件

**后端（laravel_php/）**
- `bootstrap/app.php` - 应用引导、路由注册
- `app/Common/Controller/BaseLikeAdminController.php` - API 控制器基类
- `app/Common/Service/JsonService.php` - 响应格式化
- `app/Common/common.php` - 全局辅助函数

**后台前端（admin/）**
- `src/config/index.ts` - 全局配置（baseUrl、版本号）
- `src/permission.ts` - 路由守卫、动态路由添加
- `src/stores/modules/user.ts` - 用户状态、登录逻辑
- `src/utils/request/index.ts` - Axios 封装
- `src/hooks/usePaging.ts` - 列表分页逻辑复用
- `vite.config.ts` - Vite 配置（base: '/admin/'）

**小程序端（uniapp/）**
- `src/config/index.ts` - 全局配置
- `src/stores/user.ts` - 用户状态、登录逻辑
- `src/utils/request/index.ts` - 请求封装
- `src/pages.json` - 路由和页面配置

## 技术栈

### 后端（laravel_php/）
- PHP 8.2+, Laravel 11, MySQL 8.0
- 测试框架：PEST
- 集成服务：EasyWeChat（微信）, 阿里云/腾讯云/七牛云存储

### 后台前端（admin/）
- Vue 3.5 + TypeScript + Vite 6
- UI 组件：Element Plus 2.9
- 状态管理：Pinia 2.3
- 样式方案：Tailwind CSS 3.4 + SCSS
- 富文本：wangEditor 5
- 图表：ECharts 5 + vue-echarts
- HTTP：Axios（封装 Token 认证）
- 构建输出：`laravel_php/public/admin/`

### 小程序（uniapp/）
- Uni-app + Vue 3 Composition API
- UI 组件：uView UI
- 分页组件：z-paging
- 状态管理：Pinia
- 构建工具：HBuilderX / Vite

## 数据库规范（重要）

### 数据库连接
- **查询数据库时必须使用 `mysql_ro` MCP 工具**

### 表名前缀规范
- **所有表统一使用 `mj_` 前缀**（mojin 简称）
  - 业务表：`mj_lunch_plan`、`mj_restaurant`、`mj_user_history` 等
  - 系统表：`mj_system_menu`、`mj_system_role`、`mj_admin` 等
- Model 中 `$table` 属性不含前缀（Laravel 自动添加）

### 时间字段规范
- 使用 `int unsigned` 存储 Unix 时间戳
- 字段名：`create_time`、`update_time`、`delete_time`

### 数据库设计（核心表）

#### 午餐方案
- `mj_lunch_plan` - 午餐方案模板
- `mj_lunch_keyword` - 搜索关键词配置
- `mj_lunch_remark` - 备注口令配置

#### 餐饮数据
- `mj_restaurant` - 餐饮店铺
- `mj_restaurant_dish` - 菜品数据
- `mj_restaurant_category` - 餐饮分类

#### 用户相关
- `mj_user` - 小程序用户
- `mj_user_history` - 使用记录
- `mj_user_favorite` - 用户收藏

#### 系统管理
- `mj_admin` - 管理员
- `mj_system_menu` - 系统菜单
- `mj_system_role` - 系统角色
- `mj_system_role_menu` - 角色菜单关联

## 部署说明（宝塔面板）

Nginx 伪静态规则：
```nginx
location ~ ^/(admin|mobile|pc)/ {
    try_files $uri $uri/ /$1/index.html;
}
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

需要在 PHP 禁用函数中移除 `symlink`，然后执行 `php artisan storage:link`。

## 开发规范

### 编码规范
- 后端：PSR-12
- 前端：ESLint + Prettier
- 提交信息：Conventional Commits

---

## 三端联动开发规则（重要）

> **核心原则：任何涉及数据结构、接口、业务逻辑的变更，必须同步考虑三端影响，不可遗漏。**

### 变更检查清单

#### 1. 新增/修改数据库字段
```
□ 数据库迁移文件 (laravel_php/database/migrations/)
□ 在回复中提供迁移命令或 SQL（用于服务器手动执行）
□ Model 模型更新 (laravel_php/app/Common/Model/ 或 app/Models/)
□ 后台接口返回字段 (Adminapi/Controller 或 Logic)
□ 小程序接口返回字段 (Api/Controller 或 Logic)
□ 后台前端表格/表单 (admin/src/views/)
□ 后台前端 TypeScript 类型定义
□ 小程序页面展示/表单 (uniapp/src/pages/)
```

#### 2. 新增业务模块
```
□ 后端 - 路由定义 (Adminapi/Route/ 或 Api/Route/)
□ 后端 - Controller + Logic + Lists + Validate
□ 后端 - 菜单权限数据 (数据库 mj_system_menu)
□ 后台前端 - API 接口文件 (admin/src/api/)
□ 后台前端 - 页面组件 (admin/src/views/)
□ 后台前端 - 路由会自动从后端菜单加载
□ 小程序 - API 接口文件 (uniapp/src/api/)
□ 小程序 - 页面文件 (uniapp/src/pages/)
□ 小程序 - pages.json 路由注册
```

#### 3. 修改接口响应格式
```
□ 后端接口返回结构变更
□ 后台前端对应 API 调用处理
□ 小程序对应 API 调用处理
□ 相关 TypeScript 类型更新
```

#### 4. 枚举/状态值变更
```
□ 后端 Enum 定义 (laravel_php/app/Common/Enum/)
□ 后台前端状态映射 (字典或常量)
□ 小程序状态映射
```

### 三端文件对应速查表

| 功能类型 | 后端 (laravel_php) | 后台前端 (admin) | 小程序 (uniapp) |
|----------|-------------------|------------------|-----------------|
| 路由 | `app/Adminapi/Route/` | 动态加载 | `pages.json` |
| 控制器 | `app/Adminapi/Controller/` | - | - |
| 业务逻辑 | `app/Adminapi/Logic/` | - | - |
| 数据验证 | `app/Adminapi/Validate/` | 表单 rules | 表单验证 |
| 列表查询 | `app/Adminapi/Lists/` | - | - |
| 数据模型 | `app/Common/Model/` | TS 类型 | - |
| API 定义 | - | `src/api/` | `src/api/` |
| 页面视图 | - | `src/views/` | `src/pages/` |
| 状态管理 | - | `src/stores/` | `src/stores/` |
| 公共组件 | - | `src/components/` | `src/components/` |
| 工具函数 | `app/Common/` | `src/utils/` | `src/utils/` |
| 枚举常量 | `app/Common/Enum/` | `src/enums/` | `src/enums/` |

### 开发流程建议

1. **需求分析** → 确定涉及哪些端
2. **数据库设计** → 先确定表结构和字段
3. **后端开发** → Controller/Logic/Validate/Route
4. **后台前端** → API/Views/表单表格
5. **小程序端** → API/Pages/交互
6. **联调测试** → 三端数据一致性验证

### API 接口约定

| 端 | 接口前缀 | 认证方式 | 目录 |
|----|----------|----------|------|
| 后台管理 | `/adminapi/` | Admin Token | `Adminapi/` |
| 小程序 | `/api/` | User Token | `Api/` |

### 命名一致性要求

同一业务在三端的命名应保持一致：

```
示例：午餐方案模块
├── 后端路由: /api/lunch/generate
├── 后台API: api/lunch.ts → generatePlan()
├── 后台视图: views/lunch/plan/index.vue
├── 小程序API: api/lunch.ts → generate()
└── 小程序页面: pages/lunch/generate.vue
```

### Claude Code 开发提示

当收到涉及以下关键词的需求时，自动检查三端：

- "新增字段" / "添加字段" → 检查 Model + 接口返回 + 前端展示
- "新增功能" / "新增模块" → 检查路由 + 控制器 + 前端页面
- "修改接口" / "接口调整" → 检查所有调用方
- "状态" / "枚举" / "类型" → 检查 Enum + 前端映射
- "表单" / "列表" → 检查验证规则 + 字段展示
- "权限" → 检查菜单 + 路由守卫 + 按钮权限

### 修改文件清单要求（必须遵守）

**每次完成代码修改后，必须列出所有修改的文件清单**，格式如下：

```
## 本次修改的文件清单

| 文件路径 | 修改内容 |
|---------|---------|
| `laravel_php/app/xxx/xxx.php` | 简要说明修改了什么 |
| `admin/src/xxx/xxx.vue` | 简要说明修改了什么 |
| `uniapp/src/pages/xxx/xxx.vue` | 简要说明修改了什么 |
```

这样方便用户将修改的文件上传到服务器，注意用中文。
