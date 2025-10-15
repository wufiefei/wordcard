'use client';

import { Word, PhoneticCategory } from '@/types/wordcard';
import Image from 'next/image';

interface WordCardPreviewProps {
  word: Word;
  photoPreview: string | null;
  onClose: () => void;
}

// 自然拼读颜色映射
const phoneticColors: Record<PhoneticCategory, string> = {
  'short-vowel': 'text-red-600',
  'long-vowel': 'text-blue-600',
  'consonant': 'text-black',
  'digraph': 'text-orange-600',
  'silent': 'text-gray-400',
  'r-controlled': 'text-purple-600',
  'diphthong': 'text-pink-600',
};

export default function WordCardPreview({
  word,
  photoPreview,
  onClose,
}: WordCardPreviewProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* 卡片内容 */}
        <div className="p-6">
          <div className="aspect-square bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 rounded-xl overflow-hidden shadow-lg relative">
            {/* 背景图片占位 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🎨</div>
            </div>

            {/* 人脸位置预览 */}
            {photoPreview && (
              <div
                className="absolute rounded-full overflow-hidden shadow-lg border-4 border-white"
                style={{
                  left: `${word.facePosition.x}%`,
                  top: `${word.facePosition.y}%`,
                  width: `${word.facePosition.width}%`,
                  aspectRatio: '1',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Image
                  src={photoPreview}
                  alt="宝宝照片"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* 单词文本 */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="text-4xl font-bold mb-2 drop-shadow-lg">
                {word.phoneticSegments.map((seg, idx) => (
                  <span key={idx} className={phoneticColors[seg.category]}>
                    {seg.text}
                  </span>
                ))}
              </div>
              <div className="text-2xl text-gray-700 font-medium drop-shadow">
                {word.chinese}
              </div>
            </div>
          </div>

          {/* 说明文字 */}
          {!photoPreview && (
            <div className="mt-4 text-center text-sm text-gray-500">
              上传照片后可预览宝宝头像效果
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

