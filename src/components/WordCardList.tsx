'use client';

import { Word, PhoneticCategory } from '@/types/wordcard';
import { useState } from 'react';
import WordCardPreview from './WordCardPreview';

interface WordCardListProps {
  words: Word[];
  selectedWords: Set<string>;
  onToggleWord: (wordId: string) => void;
  onToggleAll: () => void;
  photoPreview: string | null;
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

export default function WordCardList({
  words,
  selectedWords,
  onToggleWord,
  onToggleAll,
  photoPreview,
}: WordCardListProps) {
  const [previewWord, setPreviewWord] = useState<Word | null>(null);

  const allSelected = words.length > 0 && selectedWords.size === words.length;
  const someSelected = selectedWords.size > 0 && !allSelected;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
          <span>✨</span>
          <span>选择单词卡片</span>
        </h2>
        <button
          onClick={onToggleAll}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            allSelected
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-white text-green-600 border-2 border-green-500 hover:bg-green-50'
          }`}
        >
          {allSelected ? '取消全选' : someSelected ? `已选 ${selectedWords.size}` : '全选'}
        </button>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-gray-500">请先选择一个单词库</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {words.map((word) => {
            const isSelected = selectedWords.has(word.id);
            
            return (
              <div
                key={word.id}
                className={`relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'ring-4 ring-green-400' : ''
                }`}
              >
                {/* 选择框 */}
                <div
                  onClick={() => onToggleWord(word.id)}
                  className="absolute top-2 left-2 z-10"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-green-500 border-green-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>

                {/* 卡片预览 */}
                <div
                  onClick={() => setPreviewWord(word)}
                  className="aspect-square bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center"
                >
                  <div className="text-4xl">🎨</div>
                </div>

                {/* 单词信息 */}
                <div className="p-3">
                  <div className="font-bold text-center mb-1">
                    {word.phoneticSegments.map((seg, idx) => (
                      <span key={idx} className={phoneticColors[seg.category]}>
                        {seg.text}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {word.chinese}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 预览弹窗 */}
      {previewWord && (
        <WordCardPreview
          word={previewWord}
          photoPreview={photoPreview}
          onClose={() => setPreviewWord(null)}
        />
      )}
    </div>
  );
}

