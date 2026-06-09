# 课件上传配置指南

## 概述

本系统支持两种存储模式：

| 模式 | 存储位置 | 文件大小限制 | 适用场景 |
|------|----------|-------------|----------|
| 💾 本地模式 | 浏览器LocalStorage | < 5MB | 开发测试、小文件 |
| ☁️ 云端模式 | 阿里云OSS | < 50MB | 正式使用、中大文件 |

---

## 方案一：本地模式（无需配置，立即可用）

**优点**：无需配置，直接使用
**缺点**：文件大小受限（约5MB），关闭浏览器后数据会丢失

当前系统默认使用本地模式，可以直接上传小于5MB的ZIP文件进行预览测试。

---

## 方案二：云端模式（推荐生产环境使用）

### 需要准备

1. **阿里云账号**：https://www.aliyun.com/
2. **OSS Bucket**：对象存储空间
3. **AccessKey**：访问凭证

### 配置步骤

#### 1. 创建阿里云OSS Bucket

1. 登录阿里云 → 对象存储OSS
2. 点击「创建Bucket」
3. 填写信息：
   - Bucket名称：`lms-courseware`（可自定义）
   - 地域：选择离您最近的区域
   - 存储类型：标准存储
   - ACL：私有

#### 2. 获取AccessKey

1. 阿里云控制台 → 右上角头像 → AccessKey管理
2. 创建AccessKey
3. 保存 AccessKey ID 和 AccessKey Secret

#### 3. 配置CORS（跨域）

1. 进入OSS控制台 → 选择Bucket
2. 「数据安全」→「跨域设置」
3. 创建规则：
   - 来源：`*`（或填写Vercel域名）
   - 允许Methods：GET, POST, PUT, DELETE, HEAD, OPTIONS
   - 允许Headers：`*`
   - 暴露Headers：`*`

#### 4. 在Vercel配置环境变量

1. 登录 Vercel
2. 进入项目 → Settings → Environment Variables
3. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| OSS_REGION | `oss-cn-hangzhou`（您的OSS区域） |
| OSS_BUCKET | `lms-courseware`（您的Bucket名称） |
| OSS_ACCESS_KEY_ID | 您的AccessKey ID |
| OSS_ACCESS_KEY_SECRET | 您的AccessKey Secret |

#### 5. 重新部署

添加环境变量后，需要重新部署才能生效：
```
vercel --prod
```

### 免费额度

阿里云OSS免费额度（个人/小团队完全够用）：

| 项目 | 免费额度 |
|------|----------|
| 存储空间 | 5 GB |
| 上传请求 | 10万次/月 |
| 下载请求 | 100万次/月 |
| 内网流量 | 10 GB/月 |
| 外网流量 | 3 GB/月 |

---

## 文件上传流程

### 本地模式流程
```
选择文件 → 读取到内存 → Base64编码 → 保存到LocalStorage → 生成预览
```

### 云端模式流程
```
选择文件 → 读取到内存 → Base64编码 → POST到/api/upload → 上传到OSS → 保存记录 → 生成预览
```

---

## 预览工作原理

1. **有URL（云端）**：直接从OSS下载ZIP → 解压 → iframe播放
2. **无URL有数据（本地）**：从LocalStorage读取Base64 → 解压 → iframe播放
3. **无数据**：显示错误提示

---

## 常见问题

### Q: 上传失败 "Maximum call stack size exceeded"
A: 文件过大，LocalStorage存储空间不足。请配置OSS云存储。

### Q: 预览显示空白
A: 可能原因：
- 入口文件名称不对（试试改为 index.html）
- 课件包结构不是标准Storyline导出格式

### Q: 阿里云OSS费用高吗？
A: 每月3GB免费外网流量，个人学习使用完全免费。

---

## 推荐的ATA系统课件大小

| 内容类型 | 建议大小 | 存储方式 |
|---------|---------|---------|
| 单章节HTML | < 5MB | 本地/OSS |
| 多章节打包 | 5-20MB | OSS |
| 高清视频课件 | 20-50MB | OSS + 视频CDN |
| 超大完整课程 | > 50MB | OSS + 分片加载 |
