'use client';

import { useState } from 'react';
import Image from 'next/image';
import { removeBackground } from '@/utils/backgroundRemoval';
import ImageEditor from './ImageEditor';

interface Step1PhotoUploadProps {
  photoPreview: string | null;
  onPhotoUpload: (file: File, previewUrl: string) => void;
  onNext: () => void;
}

export default function Step1PhotoUpload({
  photoPreview,
  onPhotoUpload,
  onNext,
}: Step1PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  // const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    
    try {
      // 1. 创建原图预览
      const originalUrl = URL.createObjectURL(file);
      onPhotoUpload(file, originalUrl);
      setProcessProgress(10);
      
      // 2. 执行自动背景移除
      console.log('开始自动抠图...');
      const resultBlob = await removeBackground(file, (progress) => {
        // 进度映射: 10% -> 90%
        setProcessProgress(10 + progress * 0.8);
      });
      
      if (resultBlob) {
        // 抠图成功，显示结果
        const resultUrl = URL.createObjectURL(resultBlob);
        setProcessedImageUrl(resultUrl);
        
        // 更新上传的文件为抠图后的版本
        const processedFile = new File([resultBlob], 'processed.png', { type: 'image/png' });
        onPhotoUpload(processedFile, resultUrl);
        
        console.log('✅ 自动抠图成功');
      } else {
        // 抠图失败，使用原图
        console.warn('⚠️ 抠图失败，使用原图');
        setProcessedImageUrl(originalUrl);
      }
      
      setProcessProgress(100);
      
    } catch (error) {
      console.error('处理图片失败:', error);
      // 降级：使用原图
      const originalUrl = URL.createObjectURL(file);
      setProcessedImageUrl(originalUrl);
      setProcessProgress(100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleEditComplete = (editedBlob: Blob) => {
    const editedUrl = URL.createObjectURL(editedBlob);
    setProcessedImageUrl(editedUrl);
    // 更新上传的图片
    const editedFile = new File([editedBlob], 'edited.png', { type: 'image/png' });
    onPhotoUpload(editedFile, editedUrl);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-20 lg:pb-6">
        {/* 左侧：上传区域 - 简化版 */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
              <span>📸</span>
              <span>上传宝宝照片</span>
            </h2>

            {/* 照片要求提示 */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                💡 <strong>照片要求：</strong>请上传宝宝正面清晰照（露出完整五官，无遮挡），背景简洁，光线充足，避免模糊、过暗或过亮
              </p>
            </div>

            <div
              className={`relative border-3 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-pink-200 bg-pink-50/30'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={photoPreview}
                      alt="预览"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {isProcessing && (
                    <div className="text-sm text-gray-600">
                      <div className="mb-2">
                        {processProgress < 90 ? `智能抠图中... ${Math.round(processProgress)}%` :
                         '处理完成...'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${processProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <label className="inline-block cursor-pointer px-4 py-2 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600 transition-colors">
                    重新选择
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-5xl">👶</div>
                  <p className="text-gray-600 text-sm">拖拽照片到这里</p>
                  <p className="text-xs text-gray-400">或</p>
                  <label className="inline-block cursor-pointer px-5 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-md text-sm">
                    选择照片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {photoPreview && !isProcessing && (
              <div className="mt-4">
                <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium text-green-700 mb-1">✅ 自动抠图完成</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 如不满意可点击编辑</li>
                    <li>• 使用擦除/还原优化</li>
                    <li>• 或直接下一步</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：抠图预览和编辑 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-purple-600 flex items-center gap-2">
                <span>✨</span>
                <span>抠图预览与编辑</span>
              </h2>
              {processedImageUrl && (
                <button
                  onClick={() => setShowEditor(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md text-sm font-medium"
                >
                  🖌️ 编辑图片
                </button>
              )}
            </div>

            {processedImageUrl ? (
              <div className="flex-1 flex flex-col">
                {/* 预览区域 */}
                <div className="flex-1 relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden border-2 border-purple-200 flex items-center justify-center mb-4">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px',
                    }}
                  />
                  <div className="relative max-w-full max-h-full p-4">
                    <Image
                      src={processedImageUrl}
                      alt="抠图预览"
                      width={400}
                      height={400}
                      className="object-contain max-h-[500px] shadow-2xl"
                    />
                  </div>
                </div>

              </div>
            ) : photoPreview ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4 animate-pulse">🎨</div>
                  <p>AI智能抠图中...</p>
                  <p className="text-xs mt-2">请稍候，首次使用需要加载模型</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p>上传照片后自动抠图</p>
                  <p className="text-xs mt-2">AI智能识别人像</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片编辑器模态框 */}
      {showEditor && processedImageUrl && (
        <ImageEditor
          imageUrl={processedImageUrl}
          onSave={handleEditComplete}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* 固定底部按钮 - 移动端 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden z-30">
        <button
          onClick={onNext}
          disabled={!processedImageUrl || isProcessing}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            processedImageUrl && !isProcessing
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? '处理中...' : processedImageUrl ? '下一步：选择单词 →' : '请先上传照片'}
        </button>
      </div>

      {/* 桌面端按钮 */}
      <div className="hidden lg:block mt-4">
        <button
          onClick={onNext}
          disabled={!processedImageUrl || isProcessing}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            processedImageUrl && !isProcessing
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? '处理中...' : processedImageUrl ? '下一步：选择单词 →' : '请先上传照片'}
        </button>
      </div>
    </div>
  );
}
