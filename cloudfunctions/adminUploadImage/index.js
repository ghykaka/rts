const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 上传图片到云存储
 * 支持前端直接调用
 */
exports.main = async (event, context) => {
  const { file, filename } = event

  if (!file) {
    return { success: false, error: '文件内容不能为空' }
  }

  try {
    // 解码 base64 文件内容
    const buffer = Buffer.from(file, 'base64')

    // 生成文件名
    const ext = filename?.split('.').pop() || 'jpg'
    const key = `function-images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`

    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: key,
      fileContent: buffer
    })

    // 获取文件访问链接
    // 使用较长的过期时间（30天），避免频繁过期
    const getUrlResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })

    const tempUrl = getUrlResult.fileList[0]?.tempFileURL || ''

    return {
      success: true,
      fileID: uploadResult.fileID,
      cloudPath: key,
      url: tempUrl
    }
  } catch (err) {
    console.error('上传图片失败:', err)
    return { success: false, error: err.message || '上传失败' }
  }
}
