/**
 * 获取课件信息API
 * 根据fileId获取课件URL用于预览
 */

const fs = require('fs');

// 内存存储（需要与upload.js共享）
const uploadedFiles = {};

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { fileId } = req.query;
    
    if (!fileId) {
      return res.status(400).json({ error: '缺少fileId参数' });
    }
    
    // 获取OSS配置
    const region = process.env.OSS_REGION;
    const bucket = process.env.OSS_BUCKET;
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
    
    // 演示模式：返回空数据提示
    if (!region || !bucket) {
      return res.status(200).json({
        mode: 'demo',
        fileId,
        message: '演示模式：预览功能需要配置OSS'
      });
    }
    
    // 从上传记录中查找
    // 实际生产环境应该从数据库查询
    
    return res.status(200).json({
      mode: 'oss',
      fileId,
      message: '请配置数据库存储文件记录'
    });
    
  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({ error: '获取失败: ' + error.message });
  }
};
