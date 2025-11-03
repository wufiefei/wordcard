/**
 * 背景移除工具 - 后端API版本
 * 调用后端 rembg 服务进行抠图
 */

/**
 * 压缩图片到指定最大尺寸（减少上传大小）
 */
async function compressImage(file: File, maxWidth: number = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxWidth) {
        const scale = maxWidth / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`📦 图片压缩: ${Math.round(file.size / 1024)}KB → ${Math.round(blob.size / 1024)}KB`);
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        0.9
      );
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 调用后端API进行背景移除
 */
export async function removeBackground(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  try {
    console.log('🎨 开始智能抠图（后端API）...');
    
    // 1. 预压缩图片（减少上传大小）
    onProgress?.(10);
    const compressedBlob = await compressImage(imageFile, 1200);
    onProgress?.(20);
    
    // 2. 创建FormData
    const formData = new FormData();
    formData.append('image', compressedBlob, imageFile.name);
    
    // 3. 调用后端API
    onProgress?.(30);
    console.log('📤 上传图片到服务器...');
    
    const response = await fetch('/api/remove-background', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '服务器错误' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    onProgress?.(80);
    console.log('✅ 服务器处理完成');
    
    // 4. 获取处理后的图片
    const blob = await response.blob();
    
    onProgress?.(100);
    console.log('✅ 背景移除成功');
    return blob;
    
  } catch (error) {
    console.error('❌ 背景移除失败:', error);
    return null;
  }
}

/**
 * 检查浏览器是否支持背景移除
 */
export function checkBrowserSupport(): boolean {
  try {
    // 检查WebAssembly支持
    if (typeof WebAssembly === 'undefined') {
      console.warn('浏览器不支持 WebAssembly');
      return false;
    }
    
    // 检查OffscreenCanvas支持（可选）
    if (typeof OffscreenCanvas === 'undefined') {
      console.warn('浏览器不支持 OffscreenCanvas，性能可能受影响');
    }
    
    return true;
  } catch (error) {
    console.error('浏览器检查失败:', error);
    return false;
  }
}

