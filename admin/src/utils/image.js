// 图片压缩工具
export const compressImage = (file, options = {}) => {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1920 } = options
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 计算压缩后的尺寸
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        // 创建画布
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 如果压缩后比原文件还大，使用原文件
              if (blob.size > file.size) {
                resolve(file)
              } else {
                resolve(new File([blob], file.name, { type: file.type }))
              }
            } else {
              resolve(file)
            }
          },
          file.type || 'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// base64 转 Blob
export const base64ToBlob = (base64) => {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([uInt8Array], { type: contentType })
}
