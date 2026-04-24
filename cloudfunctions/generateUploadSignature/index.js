/**
 * 生成COS上传签名
 * 返回签名让前端直接上传到COS
 */
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action } = event
  
  console.log('generateUploadSignature 被调用, action:', action, 'context:', JSON.stringify(context))

  // 生成COS上传签名（永久密钥方式）
  if (action === 'generateUploadSignature') {
    try {
      console.log('开始生成COS上传签名')
      const bucket = process.env.COS_BUCKET || '6c69-liandaofutou-2gdayw0068d938b3-1417102114'
      const region = process.env.COS_REGION || 'ap-shanghai'
      const secretId = process.env.TENCENT_SECRET_ID || ''
      const secretKey = process.env.TENCENT_SECRET_KEY || ''

      if (!secretId || !secretKey) {
        return { success: false, error: 'COS凭证未配置' }
      }

      // 生成签名过期时间（1小时后过期）
      const startTime = Math.floor(Date.now() / 1000)
      const expiredTime = startTime + 3600

      // TC3-HMAC-SHA256 签名算法
      const httpString = [
        'PUT',
        '/articles/*',  // 允许上传到 articles 目录
        '',
        'content-type=image/jpeg',
        `host=${bucket}.cos.${region}.myqcloud.com`,
        ''
      ].join('\n')

      const signTime = `${startTime};${expiredTime}`
      const httpStringEncoded = crypto.createHash('sha256').update(httpString).digest('hex')
      const stringToSign = ['sha256', signTime, httpStringEncoded, ''].join('\n')

      const secretDate = crypto.createHmac('sha256', `cos3api ${startTime.toString().slice(0, 8)}`).update(secretKey).digest()
      const secretSign = crypto.createHmac('sha256', secretDate).update(stringToSign).digest('hex')
      const authorization = `q-sign-algorithm=sha256&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}&q-header-list=content-type;host&q-url-param-list=&q-signature=${secretSign}`

      return {
        success: true,
        data: {
          bucket,
          region,
          authorization,
          expiredTime
        }
      }
    } catch (err) {
      console.error('生成上传签名失败:', err)
      return { success: false, error: '生成上传签名失败' }
    }
  }

  return { success: false, error: '未知操作' }
}
