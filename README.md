# 航空培训在线学习平台（C919 CBT LMS）

基于 Web 的机务维修培训在线学习系统，支持 Storyline H5 课件的嵌入与播放。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 功能特性

### ✅ 学生端
- 📚 **课程学习** - 在线浏览和学习已分配的课程
- 🎬 **课件播放** - 支持 Storyline HTML5 互动课件嵌入播放
- ⏱️ **时长追踪** - 自动记录学习时长和进度
- 📝 **学习笔记** - 边学边记，方便复习
- 📊 **学习档案** - 查看个人学习历史和统计
- 📤 **报告导出** - 导出个人学习报告

### ✅ 管理后台
- 📈 **数据仪表盘** - 实时查看学习数据概览
- 👥 **学员管理** - 学员的增删改查、批量导入
- 📚 **课程管理** - 课程的创建、编辑、发布
- 📦 **课件管理** - Storyline H5 课件包上传和管理
- 🎯 **课程分配** - 向学员分配学习任务
- 📋 **学习记录** - 详细查看所有学习行为
- 📊 **统计报表** - 按学员/课程/部门/时间多维度分析
- 📤 **数据导出** - 支持 CSV/Excel 格式导出

### 🔮 预留扩展
- **课程分类** - 机务CBT、ACPC飞行训练、PBN导航等
- **课件类型** - HTML5互动、视频、PDF文档
- **用户角色** - 学员、培训管理员、教员、系统管理员

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (纯前端)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  学生端      │  │  管理后台     │  │  共享组件    │    │
│  │  (Student)  │  │  (Admin)     │  │  (Shared)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    REST API (待实现)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  认证服务    │  │  业务服务    │  │  文件服务    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      数据存储                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │    MinIO     │    │
│  │  (主数据)    │  │  (缓存)      │  │  (文件存储)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 方式一：直接打开（演示模式）

1. 下载或克隆项目
2. 进入 `student/` 或 `admin/` 目录
3. 直接用浏览器打开 `login.html`

**演示账号**：
- 学员：张伟（zhangwei / 123456）
- 管理员：admin（admin / admin123）

### 方式二：本地服务器

```bash
# 使用 Python
cd lms-platform
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 VS Code Live Server 插件
```

访问 `http://localhost:8080/student/login.html`

### 方式三：部署到服务器

```bash
# Nginx 配置示例
server {
    listen 80;
    server_name lms.example.com;
    root /var/www/lms-platform;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 课件文件代理
    location /api/ {
        proxy_pass http://backend:3000;
    }
}
```

---

## 目录结构

```
lms-platform/
├── student/                 # 学生端
│   ├── login.html          # 登录页面
│   ├── index.html          # 学习中心
│   ├── player.html         # 课件播放器
│   └── profile.html        # 学习档案
├── admin/                   # 管理后台
│   ├── login.html          # 后台登录
│   ├── dashboard.html      # 数据仪表盘
│   ├── students.html       # 学员管理
│   ├── courses.html        # 课程管理
│   ├── courseware.html     # 课件管理
│   ├── assignments.html     # 课程分配
│   ├── records.html        # 学习记录
│   └── reports.html        # 统计报表
├── shared/                  # 共享资源
│   ├── styles.css          # 全局样式
│   └── app.js              # 核心JS库
├── api-spec/                # API规范
│   └── rest-api.md         # REST API文档
├── attachments/            # 附件资源
└── README.md               # 项目说明
```

---

## Storyline 课件接入

### 课件要求

1. 使用 Articulate Storyline 导出为 **HTML5** 格式
2. 导出后得到一个包含 `index.html` 的文件夹
3. 将整个文件夹打包为 **ZIP** 文件上传

### 接入流程

1. 登录管理后台
2. 进入「课件管理」
3. 选择目标课程
4. 上传 ZIP 课件包
5. 系统自动解析入口文件
6. 发布后学员即可学习

### JavaScript 通信

平台与 Storyline 通过 `window.postMessage` 通信：

```javascript
// Storyline 课件中调用
// 获取当前进度
window.parent.postMessage({
  type: 'storyline',
  action: 'getProgress'
}, '*');

// 标记完成
window.parent.postMessage({
  type: 'storyline',
  action: 'complete'
}, '*');
```

---

## 数据字段

### 学习记录必填字段

| 字段 | 类型 | 描述 |
|------|------|------|
| id | string | 记录ID |
| userId | string | 学员ID |
| courseId | string | 课程ID |
| coursewareId | string | 课件ID |
| startTime | datetime | 开始学习时间 |
| endTime | datetime | 结束学习时间 |
| duration | int | 学习时长（秒） |
| progress | int | 学习进度（0-100） |
| status | string | 状态（in_progress/completed/incomplete） |
| score | int | 成绩分数 |

---

## 后端集成

### 环境变量

```env
# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/lms

# Redis
REDIS_URL=redis://localhost:6379

# 文件存储
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=courseware

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 文件大小限制
MAX_UPLOAD_SIZE=500MB
```

### 数据库初始化

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- 课程表
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  category_name VARCHAR(100),
  description TEXT,
  cover_url VARCHAR(500),
  instructor VARCHAR(100),
  total_hours INT DEFAULT 0,
  chapters INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  courseware_id UUID,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INT DEFAULT 0,
  progress INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress',
  score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 浏览器兼容

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

**不支持 IE 浏览器**

---

## 常见问题

### Q: 课件无法播放？
- 检查是否使用 HTML5 格式导出（非 Flash）
- 确保 `index.html` 在压缩包根目录
- 检查浏览器控制台是否有跨域错误

### Q: 学习时长不准确？
- 平台会排除超过 30 分钟的空闲时间
- 建议在课件内集成标准计时 API

### Q: 如何批量导入学员？
- 在学员管理页面使用「导入」功能
- 支持 CSV 格式：姓名,邮箱,部门,手机号

---

## 更新日志

### v1.0.0 (2024-06-08)
- ✅ 完成学生端和管理后台开发
- ✅ 支持 Storyline H5 课件嵌入
- ✅ 实现完整的学习追踪功能
- ✅ 数据导出功能
- ✅ 预留 ACPC/PBN 扩展接口

---

## 联系方式

- **技术支持**: 航空产品线技术团队
- **文档**: [飞书Wiki](https://jiean.feishu.cn/wiki/XpUnwqUljiSoyikZtGYcf4Exnoh)
- **问题反馈**: lizhao@jiean.net

---

## 许可证

© 2024 捷安高科航空产品线 - 内部使用
