'use client';

import { useState } from 'react';
import Image from 'next/image';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onPhotoUpload(file, url);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-20 lg:pb-6">
        {/* 左侧：上传区域 */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-pink-600 mb-4 flex items-center gap-2">
              <span>📸</span>
              <span>上传宝宝照片</span>
            </h2>

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
                  <label className="inline-block cursor-pointer px-4 py-2 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600 transition-colors">
                    重新选择
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
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

            {photoPreview && (
              <div className="mt-4 text-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                ✓ 照片已上传
              </div>
            )}
          </div>
        </div>

        {/* 右侧：抠图预览 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <h2 className="text-xl font-semibold text-purple-600 mb-4 flex items-center gap-2">
              <span>✨</span>
              <span>抠图预览</span>
            </h2>

            {photoPreview ? (
              <div className="space-y-4">
                {/* 预览区域 */}
                <div className="relative aspect-square max-w-lg mx-auto bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden border-2 border-purple-200">
                  <Image
                    src={photoPreview}
                    alt="抠图预览"
                    fill
                    className="object-contain p-8"
                  />
                  {/* 圆形遮罩示意 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 rounded-full border-4 border-dashed border-purple-400 opacity-50" />
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-medium text-purple-700 mb-2">💡 智能抠图（开发中）</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 将自动识别人脸区域</li>
                    <li>• 可手动调整抠图范围</li>
                    <li>• 圆形虚线为预计抠图区域</li>
                  </ul>
                </div>

                {/* 编辑工具（占位） */}
                <div className="flex items-center justify-center gap-3 text-sm">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                    🔍 调整范围
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                    ↻ 旋转
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                    ✂️ 裁剪
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p>上传照片后可预览抠图效果</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 固定底部按钮 - 移动端 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden z-30">
        <button
          onClick={onNext}
          disabled={!photoPreview}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            photoPreview
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {photoPreview ? '下一步：选择单词 →' : '请先上传照片'}
        </button>
      </div>

      {/* 桌面端按钮 */}
      <div className="hidden lg:block mt-4">
        <button
          onClick={onNext}
          disabled={!photoPreview}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            photoPreview
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {photoPreview ? '下一步：选择单词 →' : '请先上传照片'}
        </button>
      </div>
    </div>
  );
}

