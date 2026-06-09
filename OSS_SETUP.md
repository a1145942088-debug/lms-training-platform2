# =============================================
# 阿里云OSS配置说明
# =============================================

## 一、创建阿里云OSS Bucket

1. 登录阿里云官网：https://www.aliyun.com/
2. 进入对象存储OSS控制台：https://oss.console.aliyun.com/
3. 点击"创建Bucket"
4. 配置：
   - Bucket名称：例如 `lms-courseware`
   - 地域：选择离您最近的区域（如 `华东1（杭州）`）
   - 存储类型：标准存储
   - ACL：私有（私有读写更安全）
5. 点击"确定"创建

## 二、获取AccessKey

1. 登录阿里云控制台
2. 点击右上角头像 → AccessKey管理
3. 创建AccessKey（或者使用RAM子账号的AccessKey）
4. 保存AccessKey ID 和 AccessKey Secret

## 三、配置CORS（跨域访问）

1. 进入OSS控制台 → 选择创建的Bucket
2. 点击"数据安全" → "跨域设置"
3. 点击"创建规则"，配置：
   - 来源：`*`（生产环境建议填写具体域名）
   - 允许Methods：GET, POST, PUT, DELETE, HEAD, OPTIONS
   - 允许Headers：`*`
   - 暴露Headers：`*`
   - 缓存时间：600

## 四、在Vercel中配置环境变量

1. 登录Vercel：https://vercel.com/
2. 进入您的项目 → Settings → Environment Variables
3. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| OSS_REGION | 您的OSS区域，如 `oss-cn-hangzhou` |
| OSS_BUCKET | 您的Bucket名称，如 `lms-courseware` |
| OSS_ACCESS_KEY_ID | 您的AccessKey ID |
| OSS_ACCESS_KEY_SECRET | 您的AccessKey Secret |

## 五、OSS免费额度

阿里云OSS免费额度：
- 存储空间：5GB
- 标准存储Put请求：10万次/月
- 标准存储Get请求：100万次/月
- 内网流出流量：10GB/月
- 外网流出流量：3GB/月

对于小型培训平台来说，**完全免费够用**。

## 六、Bucket权限设置

如果前端需要直接上传到OSS，需要设置Bucket Policy：

1. OSS控制台 → Bucket → 权限管理 → Bucket Policy
2. 点击"添加Bucket Policy"
3. 配置：
   - 授权策略：只读/读写
   - 授权用户：所有用户
   - 资源：courseware/*
4. 保存

## 七、阿里云RAM子账号（推荐）

为了安全，建议创建RAM子账号：

1. 阿里云RAM控制台：https://ram.console.aliyun.com/
2. 创建用户 → 勾选"Open API调用"
3. 给用户添加OSS权限：
   - AliyunOSSFullAccess（完全访问OSS）
   - 或者创建自定义策略限制只能操作courseware目录
4. 使用子账号的AccessKey配置Vercel

## 八、本地测试

创建 `.env.local` 文件（不要提交到Git）：

```env
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=lms-courseware
OSS_ACCESS_KEY_ID=您的AccessKeyID
OSS_ACCESS_KEY_SECRET=您的AccessKeySecret
```

## 九、费用说明

| 项目 | 免费额度 | 超出后费用 |
|------|---------|-----------|
| 存储 | 5GB | ¥0.12/GB/月 |
| 上传 | 免费 | 免费 |
| 下载（内网） | 10GB/月 | ¥0.5/GB |
| 下载（外网） | 3GB/月 | ¥0.5/GB |

**一般培训平台使用，免费额度完全足够。**
