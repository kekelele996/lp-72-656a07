# 团队知识库系统

一个面向团队的文档知识管理系统，支持富文本编辑、文档组织、全文搜索、版本控制和权限管理。

## 快速启动（Docker Compose 一键部署）

```bash
# 复制环境变量配置
cp .env.example .env

# 构建并启动所有服务
docker compose up -d --build
```

启动后访问：
- 前端：http://localhost:8103
- 后端 API：http://localhost:3103

测试账号：
- 管理员：`admin` / `admin123`
- 普通成员：`member` / `member123`

## 本地开发方式

### 前置要求
- Node.js 18+
- MongoDB 6.0+

### 后端启动

```bash
cd backend
npm install
npm run start:dev
```

后端地址：http://localhost:3000

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5173

### 加载种子数据

```bash
cd backend
npm run seed
```

## 访问地址

| 服务 | Docker 部署 | 本地开发 |
|------|-------------|----------|
| 前端 | http://localhost:8103 | http://localhost:5173 |
| 后端 API | http://localhost:3103 | http://localhost:3000 |
| MongoDB | 端口 2903 | 端口 27017 |
| 健康检查 | http://localhost:3103/api/health | http://localhost:3000/api/health |

## 主要功能

- **用户注册与登录**：支持 JWT 认证，安全登录系统
- **富文本编辑器**：基于 TipTap 实现，支持标题、加粗、列表、代码块、图片等
- **文档树形管理**：左侧边栏展示文档树，支持创建文件夹和嵌套结构
- **全文搜索**：基于 MongoDB 全文索引，支持标题和正文内容搜索，结果高亮显示
- **版本控制**：自动保存历史版本，支持版本对比（diff）和回滚
- **权限管理**：文档可设置为公开/私密，公开文档所有人可见，私密文档仅创建者可见
- **标签系统**：给文档添加标签，按标签筛选文档
- **回收站**：删除的文档可恢复或永久删除
- **评论系统**：文档底部评论区，支持添加和删除评论

## 技术栈

| 类型 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式框架 | Tailwind CSS |
| 富文本编辑 | TipTap |
| 状态管理 | Zustand |
| 路由管理 | React Router |
| HTTP 客户端 | Axios |
| 后端框架 | NestJS + TypeScript |
| 数据库 | MongoDB + Mongoose |
| 认证方式 | JWT (Passport-JWT) |
| 代码对比 | diff 库 |
| 容器化 | Docker + Docker Compose |

## 项目目录结构

```
.
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── auth/              # 认证模块
│   │   ├── users/             # 用户模块
│   │   ├── documents/         # 文档模块
│   │   ├── folders/           # 文件夹模块
│   │   ├── versions/          # 版本控制模块
│   │   ├── search/            # 搜索模块
│   │   ├── tags/              # 标签模块
│   │   ├── trash/             # 回收站模块
│   │   ├── comments/          # 评论模块
│   │   ├── health/            # 健康检查模块
│   │   ├── common/            # 公共模块（过滤器等）
│   │   ├── app.module.ts      # 主模块
│   │   ├── main.ts            # 入口文件
│   │   └── seed.ts            # 种子数据脚本
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # 布局组件
│   │   │   ├── editor/        # 编辑器组件
│   │   │   └── common/        # 通用组件
│   │   ├── pages/             # 页面组件
│   │   ├── store/             # 状态管理
│   │   ├── lib/               # 工具库（axios, api 封装）
│   │   ├── types/             # 类型定义
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml          # Docker 编排配置
├── .env.example                # 环境变量示例
└── README.md
```

## 环境变量说明

复制 `.env.example` 为 `.env` 并根据需要修改：

```bash
# MongoDB 配置
MONGO_INITDB_ROOT_USERNAME=admin          # MongoDB 管理员用户名
MONGO_INITDB_ROOT_PASSWORD=admin123       # MongoDB 管理员密码
MONGO_DB_NAME=knowledgebase               # 数据库名称

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key      # JWT 签名密钥（生产环境必须修改）
JWT_EXPIRES_IN=7d                         # Token 过期时间

# 后端配置
BACKEND_PORT=3000                         # 后端端口
NODE_ENV=development                      # 运行环境
```

## Docker 部署说明

### 端口映射

| 容器内端口 | 宿主机端口 | 说明 |
|-----------|-----------|------|
| 80 | 8103 | 前端 Nginx |
| 3000 | 3103 | 后端 API |
| 27017 | 2903 | MongoDB |

### 数据卷

| 卷名 | 说明 |
|------|------|
| kb_mongodb_data | MongoDB 数据持久化 |

### 常用命令

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 重新构建并启动
docker compose up -d --build

# 删除所有容器和卷（清空数据）
docker compose down -v
```

### 健康检查

Docker Compose 配置了健康检查：
- MongoDB：使用 `mongosh` 执行 ping 命令检查
- 后端：访问 `/api/health` 端点检查

后端服务会等待 MongoDB 健康检查通过后启动，前端服务会等待后端健康检查通过后启动。

### 常见问题

**1. 端口被占用**
- 修改 `docker-compose.yml` 中的端口映射

**2. 数据库连接失败**
- 检查 MongoDB 容器状态：`docker compose ps`
- 查看 MongoDB 日志：`docker compose logs mongodb`
- 确认 `.env` 中的数据库配置正确

**3. 前端无法访问后端 API**
- 检查后端健康状态：`docker compose ps backend`
- 确认 nginx.conf 中的代理配置正确
- 本地开发时，Vite 已配置代理到 `http://localhost:3000`

**4. 种子数据未加载**
- Docker 部署时，后端启动后会自动执行种子脚本
- 本地开发需手动执行：`cd backend && npm run seed`

## 测试账号

系统预置以下测试账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| member | member123 | 普通成员 |

## 预置数据结构

首次启动后，系统会自动创建以下预置数据：

```
📁 产品文档
├── 产品需求文档 v1.0（3 个历史版本）
│   ├── 标题、段落、列表、代码块等富文本内容
│
└── 产品路线图
    └── 表格内容展示

📁 技术文档
├── API 接口规范
│   └── JSON 代码块示例
│
└── 数据库设计
    └── 表格和代码块

📄 团队规范（公开文档，根目录下）
```

## License

MIT License
