/**
 * 文件上传API
 * 前端将文件发送到此处，服务端转发到阿里云OSS
 */

// 内存存储（生产环境使用数据库）
const uploadedFiles = {};

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { fileName, courseId, courseName, entryFile, duration } = req.body;
    
    if (!fileName || !courseId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 获取OSS配置
    const region = process.env.OSS_REGION;
    const bucket = process.env.OSS_BUCKET;
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
    
    // 检查是否有文件数据（Base64）
    const zipData = req.body.zipData;
    
    if (!region || !bucket || !accessKeyId || !accessKeySecret) {
      // 演示模式：保存到内存/数据库
      const fileId = 'demo_' + Date.now();
      uploadedFiles[fileId] = {
        fileName,
        courseId,
        courseName,
        entryFile: entryFile || 'index.html',
        duration: duration || 30,
        zipData: zipData || '',
        uploadedAt: new Date().toISOString()
      };
      
      return res.status(200).json({
        success: true,
        mode: 'demo',
        fileId,
        message: '演示模式：文件数据已保存'
      });
    }
    
    // 真实OSS上传模式
    const OSS = require('ali-oss');
    
    const client = new OSS({
      region: region,
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
      bucket: bucket
    });
    
    // 生成OSS文件路径
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 8);
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const ossKey = `courseware/${courseId}/${timestamp}-${randomStr}${ext}`;
    
    // 如果有Base64数据，先解码
    if (zipData) {
      const buffer = Buffer.from(zipData, 'base64');
      
      await client.put(ossKey, buffer, {
        headers: {
          'Content-Type': 'application/zip'
        }
      });
    }
    
    const fileId = 'oss_' + timestamp;
    
    // 保存文件记录
    uploadedFiles[fileId] = {
      ossKey,
      fileName,
      courseId,
      courseName,
      entryFile: entryFile || 'index.html',
      duration: duration || 30,
      url: `https://${bucket}.${region}.aliyuncs.com/${ossKey}`,
      uploadedAt: new Date().toISOString()
    };
    
    return res.status(200).json({
      success: true,
      mode: 'oss',
      fileId,
      url: uploadedFiles[fileId].url,
      message: '上传成功'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: '上传失败: ' + error.message });
  }
};
