/**
 * 浏览器端背景移除工具
 * 使用 @imgly/background-removal 实现
 * 优化版本：图片预压缩 + 智能裁剪空白区域
 */

/**
 * 压缩图片到指定最大尺寸
 */
async function compressImage(file: File, maxWidth: number = 600): Promise<Blob> {
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
 * 智能裁剪透明区域，保留内容居中
 */
async function trimTransparentArea(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      
      // 创建临时canvas来分析像素
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx || !ctx) {
        reject(new Error('Canvas上下文创建失败'));
        return;
      }
      
      // 绘制图片
      tempCtx.drawImage(img, 0, 0);
      
      // 获取图像数据
      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // 找到非透明区域的边界
      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 10) { // 非透明像素
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      
      // 添加少量边距（5%）
      const padding = Math.max(5, Math.floor((maxX - minX) * 0.05));
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(width - 1, maxX + padding);
      maxY = Math.min(height - 1, maxY + padding);
      
      // 计算裁剪后的尺寸
      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;
      
      // 创建裁剪后的canvas
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      // 绘制裁剪后的图片
      ctx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`✂️ 裁剪空白区域: ${width}x${height} → ${cropWidth}x${cropHeight}`);
            resolve(blob);
          } else {
            reject(new Error('裁剪失败'));
          }
        },
        'image/png',
        1.0
      );
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(blob);
  });
}

export async function removeBackground(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  try {
    console.log('🎨 开始智能抠图（优化版）...');
    
    // 1. 预压缩图片（减少处理时间）
    onProgress?.(5);
    const compressedBlob = await compressImage(imageFile, 600);
    onProgress?.(10);
    
    // 2. 动态导入以避免SSR问题
    const { removeBackground: removeBg } = await import('@imgly/background-removal');
    
    // 创建图片URL
    const imageUrl = URL.createObjectURL(compressedBlob);
    
    // 3. 执行背景移除（使用快速模式配置）
    const blob = await removeBg(imageUrl, {
      model: 'isnet_quint8', // 使用量化模型，速度更快
      progress: (key, current, total) => {
        const progress = Math.round((current / total) * 100);
        // 进度映射: 10% -> 85%
        onProgress?.(10 + progress * 0.75);
      },
      output: {
        format: 'image/png',
        quality: 0.8,
      },
    });
    
    // 清理URL
    URL.revokeObjectURL(imageUrl);
    
    onProgress?.(90);
    
    // 4. 智能裁剪透明区域，让内容居中
    const trimmedBlob = await trimTransparentArea(blob);
    
    onProgress?.(100);
    console.log('✅ 背景移除成功（已裁剪空白区域）');
    return trimmedBlob;
    
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

