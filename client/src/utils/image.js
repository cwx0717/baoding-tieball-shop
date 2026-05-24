/**
 * 处理产品图片路径
 * 在 Vite + Vue 环境中，必须使用 new URL() 方式才能正确加载 assets 中的图片
 * 
 * @param {string} filename - 数据库中存储的图片文件名或路径
 * @returns {string} - 正确的图片路径
 */
export const getProductImage = (filename) => {
  if (!filename) {
    return getDefaultImage()
  }
  
  try {
    // 提取纯文件名（去除可能的路径前缀）
    const pureFilename = filename.replace(/^.*[\\/]/, '')
    
    // Vite 环境下必须使用 new URL() 方式
    return new URL(`../assets/${pureFilename}`, import.meta.url).href
  } catch (error) {
    console.warn(`图片 ${filename} 加载失败，使用默认图片`)
    return getDefaultImage()
  }
}

/**
 * 获取默认图片路径
 */
export const getDefaultImage = () => {
  try {
    return new URL('../assets/default-product.svg', import.meta.url).href
  } catch (error) {
    return '/assets/default-product.svg'
  }
}

/**
 * 处理通用资源路径
 * @param {string} filename - 资源文件名
 * @param {string} folder - 资源所在文件夹（默认 assets）
 * @returns {string} - 正确的资源路径
 */
export const getAssetPath = (filename, folder = 'assets') => {
  if (!filename) {
    return ''
  }
  
  try {
    // 提取纯文件名
    const pureFilename = filename.replace(/^.*[\\/]/, '')
    return new URL(`../${folder}/${pureFilename}`, import.meta.url).href
  } catch (error) {
    console.warn(`资源 ${filename} 加载失败`)
    return ''
  }
}