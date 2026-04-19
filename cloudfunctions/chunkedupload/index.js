/**
 * 分片上传控制器
 * 支持大文件分片上传到云存储
 */
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 缓存目录（云函数临时存储）
const TEMP_DIR = path.join(os.tmpdir(), 'uploads')
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

/**
 * 初始化分片上传会话
 * 返回 uploadId 用于后续分片上传
 */
async function initUpload(data) {
  const { filename, fileSize, chunkCount, userId } = data
  
  // 生成唯一上传ID
  const uploadId = crypto.randomBytes(16).toString('hex')
  
  // 创建上传会话记录
  const session = {
    uploadId,
    filename,
    fileSize,
    chunkCount,
    userId,
    chunks: [], // 已接收的分片
    status: 'uploading',
    createdAt: Date.now()
  }
  
  // 存储会话（使用缓存或数据库）
  global.uploadSessions = global.uploadSessions || {}
  global.uploadSessions[uploadId] = session
  
  // 设置过期清理（30分钟后过期）
  setTimeout(() => {
    if (global.uploadSessions && global.uploadSessions[uploadId]) {
      cleanupSession(uploadId)
    }
  }, 30 * 60 * 1000)
  
  return { uploadId, session }
}

/**
 * 上传单个分片
 */
async function uploadChunk(data) {
  const { uploadId, chunkIndex, chunk, chunkHash } = data
  
  const sessions = global.uploadSessions || {}
  const session = sessions[uploadId]
  
  if (!session) {
    return { success: false, error: '上传会话不存在或已过期' }
  }
  
  if (session.status !== 'uploading') {
    return { success: false, error: '上传会话状态异常' }
  }
  
  // 验证分片
  if (chunkIndex < 0 || chunkIndex >= session.chunkCount) {
    return { success: false, error: '分片索引无效' }
  }
  
  // 验证分片大小
  const chunkBuffer = Buffer.from(chunk, 'base64')
  const maxChunkSize = 500 * 1024 // 每个分片最大500KB
  if (chunkBuffer.length > maxChunkSize) {
    return { success: false, error: `分片大小超过${maxChunkSize / 1024}KB限制` }
  }
  
  // 保存分片到临时文件
  const chunkPath = path.join(TEMP_DIR, `${uploadId}_${chunkIndex}`)
  fs.writeFileSync(chunkPath, chunkBuffer)
  
  // 记录分片
  session.chunks[chunkIndex] = {
    index: chunkIndex,
    size: chunkBuffer.length,
    path: chunkPath,
    hash: chunkHash
  }
  
  // 检查是否所有分片都已上传
  const uploadedCount = session.chunks.filter(c => c).length
  
  return {
    success: true,
    uploadedCount,
    totalChunks: session.chunkCount,
    isComplete: uploadedCount === session.chunkCount
  }
}

/**
 * 完成上传（合并分片并上传到云存储）
 */
async function completeUpload(data) {
  const { uploadId, userId, userType } = data
  
  const sessions = global.uploadSessions || {}
  const session = sessions[uploadId]
  
  if (!session) {
    return { success: false, error: '上传会话不存在' }
  }
  
  try {
    // 合并所有分片
    const buffers = []
    for (let i = 0; i < session.chunkCount; i++) {
      if (!session.chunks[i]) {
        return { success: false, error: `缺少分片 ${i}` }
      }
      buffers.push(fs.readFileSync(session.chunks[i].path))
    }
    
    const fullBuffer = Buffer.concat(buffers)
    
    // 生成文件名
    const ext = session.filename?.split('.').pop() || 'jpg'
    const key = `function-images/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
    
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: key,
      fileContent: fullBuffer
    })
    
    // 获取访问链接
    const urlResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })
    
    const url = urlResult.fileList[0]?.tempFileURL || ''
    
    // 生成缩略图（如果需要）
    let thumbnailUrl = url
    try {
      const sharp = require('sharp')
      const thumbBuffer = await sharp(fullBuffer)
        .resize(250, 250, { withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer()
      
      const thumbKey = key.replace('_orig.', '_thumb.')
      const thumbUploadResult = await cloud.uploadFile({
        cloudPath: thumbKey,
        fileContent: thumbBuffer
      })
      
      const thumbUrlResult = await cloud.getTempFileURL({
        fileList: [thumbUploadResult.fileID]
      })
      thumbnailUrl = thumbUrlResult.fileList[0]?.tempFileURL || url
    } catch (err) {
      console.error('生成缩略图失败:', err.message)
    }
    
    // 清理临时文件
    cleanupSession(uploadId)
    
    return {
      success: true,
      data: {
        url,
        thumbnailUrl,
        fileID: uploadResult.fileID,
        cloudPath: key,
        size: fullBuffer.length
      }
    }
  } catch (err) {
    console.error('完成上传失败:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 清理上传会话和临时文件
 */
function cleanupSession(uploadId) {
  const sessions = global.uploadSessions || {}
  const session = sessions[uploadId]
  
  if (session && session.chunks) {
    for (const chunk of session.chunks) {
      if (chunk && chunk.path && fs.existsSync(chunk.path)) {
        try {
          fs.unlinkSync(chunk.path)
        } catch (e) {}
      }
    }
  }
  
  delete sessions[uploadId]
}

exports.main = async (event, context) => {
  const { action, data } = event
  
  try {
    switch (action) {
      case 'init':
        return await initUpload(data)
        
      case 'uploadChunk':
        return await uploadChunk(data)
        
      case 'complete':
        return await completeUpload(data)
        
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error('分片上传错误:', err)
    return { success: false, error: err.message }
  }
}
