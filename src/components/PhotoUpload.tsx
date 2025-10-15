'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  onPhotoUpload: (file: File, previewUrl: string) => void;
}

export default function PhotoUpload({ onPhotoUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
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
      setPreview(url);
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
    <div className="w-full">
      <h2 className="text-xl font-semibold text-pink-600 mb-3 flex items-center gap-2">
        <span>📸</span>
        <span>上传宝宝照片</span>
      </h2>
      
      <div
        className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-pink-400 bg-pink-50'
            : 'border-pink-200 bg-pink-50/30 hover:bg-pink-50/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden shadow-lg">
              <Image
                src={preview}
                alt="预览"
                fill
                className="object-cover"
              />
            </div>
            <label className="inline-block cursor-pointer px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
              重新选择照片
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">👶</div>
            <p className="text-gray-600">点击上传或拖拽照片到这里</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
            <label className="inline-block cursor-pointer px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full hover:from-pink-500 hover:to-purple-500 transition-all shadow-md hover:shadow-lg">
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
      
      {preview && (
        <div className="mt-3 text-center text-sm text-gray-500">
          ✨ 照片已上传，将自动抠图人脸部分
        </div>
      )}
    </div>
  );
}

