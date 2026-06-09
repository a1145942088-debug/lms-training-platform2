/**
 * 上传凭证API
 * 用于生成阿里云OSS上传凭证，让前端直接上传文件到OSS
 * 
 * 环境变量配置（在Vercel中设置）：
 * - OSS_REGION: OSS区域，如 oss-cn-beijing
 * - OSS_BUCKET: OSS Bucket名称
 * - OSS_ACCESS_KEY_ID: 阿里云AccessKey ID
 * - OSS_ACCESS_KEY_SECRET: 阿里云AccessKey Secret
 */

// 简单的内存存储（生产环境建议使用数据库）
const fileRegistry = {};

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { fileName, fileSize, courseId, contentType } = req.body;
    
    if (!fileName || !courseId) {
      return res.status(400).json({ error: '缺少必要参数：fileName, courseId' });
    }
    
    // 验证文件类型
    if (!fileName.toLowerCase().endsWith('.zip')) {
      return res.status(400).json({ error: '只支持ZIP格式文件' });
    }
    
    // 验证文件大小（限制50MB）
    const maxSize = 50 * 1024 * 1024;
    if (fileSize && fileSize > maxSize) {
      return res.status(400).json({ error: '文件大小不能超过50MB' });
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 8);
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const ossKey = `courseware/${courseId}/${timestamp}-${randomStr}${ext}`;
    
    // 获取OSS配置
    const region = process.env.OSS_REGION;
    const bucket = process.env.OSS_BUCKET;
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
    
    if (!region || !bucket || !accessKeyId || !accessKeySecret) {
      // 如果没有配置OSS，返回演示模式
      return res.status(200).json({
        mode: 'demo',
        message: '演示模式：OSS未配置，使用浏览器本地存储',
        fileId: `demo_${timestamp}`
      });
    }
    
    // 计算签名过期时间（30分钟后过期）
    const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    
    // 生成OSS上传凭证（使用STS Token方式）
    // 这里使用签名方式直接上传
    const policy = Buffer.from(JSON.stringify({
      expiration: expiration,
      conditions: [
        ['content-length-range', 0, maxSize],
        { bucket: bucket },
        { key: ossKey }
      ]
    })).toString('base64');
    
    // 计算签名
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(policy)
      .digest('base64');
    
    const fileId = `oss_${timestamp}`;
    
    // 记录文件信息
    fileRegistry[fileId] = {
      ossKey,
      fileName,
      courseId,
      uploaded: false,
      createdAt: new Date().toISOString()
    };
    
    // 返回上传凭证
    return res.status(200).json({
      mode: 'oss',
      fileId,
      ossKey,
      uploadUrl: `https://${bucket}.${region}.aliyuncs.com`,
      credentials: {
        OSSAccessKeyId: accessKeyId,
        policy,
        signature,
        key: ossKey,
        success_action_status: '200'
      }
    });
    
  } catch (error) {
    console.error('Upload token error:', error);
    return res.status(500).json({ error: '服务器错误: ' + error.message });
  }
};
