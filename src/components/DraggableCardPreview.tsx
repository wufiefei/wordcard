'use client';

import { Word, PhoneticCategory } from '@/types/wordcard';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface DraggableCardPreviewProps {
  word: Word;
  photoPreview: string | null;
  onClose: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

const phoneticColors: Record<PhoneticCategory, string> = {
  'short-vowel': 'text-red-600',
  'long-vowel': 'text-blue-600',
  'consonant': 'text-black',
  'digraph': 'text-orange-600',
  'silent': 'text-gray-400',
  'r-controlled': 'text-purple-600',
  'diphthong': 'text-pink-600',
};

export default function DraggableCardPreview({
  word,
  photoPreview,
  onClose,
  onPositionChange,
}: DraggableCardPreviewProps) {
  const [position, setPosition] = useState({
    x: word.facePosition.x,
    y: word.facePosition.y,
  });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // 计算相对于卡片的位置（百分比）
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 限制在卡片范围内
    const clampedX = Math.max(word.facePosition.width / 2, Math.min(100 - word.facePosition.width / 2, x));
    const clampedY = Math.max(word.facePosition.width / 2, Math.min(100 - word.facePosition.width / 2, y));

    setPosition({ x: clampedX, y: clampedY });
    onPositionChange?.(clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const touch = e.touches[0];
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(word.facePosition.width / 2, Math.min(100 - word.facePosition.width / 2, x));
    const clampedY = Math.max(word.facePosition.width / 2, Math.min(100 - word.facePosition.width / 2, y));

    setPosition({ x: clampedX, y: clampedY });
    onPositionChange?.(clampedX, clampedY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">卡片预览</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 卡片内容 */}
        <div className="p-6">
          <div
            ref={cardRef}
            className="aspect-square bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-xl overflow-hidden shadow-lg relative select-none"
          >
            {/* 背景图片占位 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🎨</div>
            </div>

            {/* 可拖动的人脸 */}
            {photoPreview && (
              <div
                className={`absolute rounded-full overflow-hidden shadow-lg border-4 border-white ${
                  isDragging ? 'cursor-grabbing ring-4 ring-blue-400' : 'cursor-grab'
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${word.facePosition.width}%`,
                  aspectRatio: '1',
                  transform: 'translate(-50%, -50%)',
                  transition: isDragging ? 'none' : 'all 0.2s ease',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <Image
                  src={photoPreview}
                  alt="宝宝照片"
                  fill
                  className="object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
            )}

            {/* 单词文本 */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="text-3xl font-bold mb-2 drop-shadow-lg">
                {word.phoneticSegments.map((seg, idx) => (
                  <span key={idx} className={phoneticColors[seg.category]}>
                    {seg.text}
                  </span>
                ))}
              </div>
              <div className="text-xl text-gray-700 font-medium drop-shadow">
                {word.chinese}
              </div>
            </div>
          </div>

          {/* 操作提示 */}
          {photoPreview && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {isDragging ? (
                <span className="text-blue-600 font-medium">
                  ✋ 拖动中...
                </span>
              ) : (
                <span>
                  💡 点击并拖动头像可调整位置
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

