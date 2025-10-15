/**
 * 浏览器端背景移除工具
 * 使用 @imgly/background-removal 实现
 */

export async function removeBackground(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<Blob | null> {
  try {
    console.log('🎨 开始背景移除...');
    
    // 动态导入以避免SSR问题
    const { removeBackground: removeBg } = await import('@imgly/background-removal');
    
    // 创建图片URL
    const imageUrl = URL.createObjectURL(imageFile);
    
    // 执行背景移除
    const blob = await removeBg(imageUrl, {
      progress: (key, current, total) => {
        const progress = Math.round((current / total) * 100);
        console.log(`处理进度: ${progress}%`);
        onProgress?.(progress);
      },
      output: {
        format: 'image/png',
        quality: 0.8,
      },
    });
    
    // 清理URL
    URL.revokeObjectURL(imageUrl);
    
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

