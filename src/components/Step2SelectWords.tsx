'use client';

import { WordLibrary, Word, CardTemplate, CARD_TEMPLATES } from '@/types/wordcard';
import { useState } from 'react';
import Image from 'next/image';
import DraggableCardPreview from './DraggableCardPreview';

interface Step2SelectWordsProps {
  libraries: WordLibrary[];
  selectedLibraryId: string | null;
  selectedWords: Set<string>;
  photoPreview: string | null;
  wordPositions: Record<string, { x: number; y: number }>;
  wordSizes?: Record<string, number>;
  wordRotations?: Record<string, number>;
  onSelectLibrary: (libraryId: string) => void;
  onToggleWord: (wordId: string) => void;
  onToggleAll: () => void;
  onUpdateWordPosition: (wordId: string, x: number, y: number) => void;
  onUpdateWordSize?: (wordId: string, width: number) => void;
  onUpdateWordRotation?: (wordId: string, rotation: number) => void;
  onSelectTemplate: (template: CardTemplate) => void;
  onNext: () => void;
  onBack: () => void;
}

// 获取卡片图片URL的辅助函数
function getCardImageUrl(word: Word, template: CardTemplate): string {
  if (!word.cardImageUrl) return '';
  
  if (typeof word.cardImageUrl === 'string') {
    return word.cardImageUrl;
  }
  
  if (typeof word.cardImageUrl === 'object' && word.cardImageUrl !== null) {
    return word.cardImageUrl[template] || word.cardImageUrl['cartoon'] || '';
  }
  
  return '';
}

export default function Step2SelectWords({
  libraries,
  selectedLibraryId,
  selectedWords,
  photoPreview,
  wordPositions,
  wordSizes,
  wordRotations,
  onSelectLibrary,
  onToggleWord,
  onToggleAll,
  onUpdateWordPosition,
  onUpdateWordSize,
  onUpdateWordRotation,
  onSelectTemplate,
  onNext,
  onBack,
}: Step2SelectWordsProps) {
  const [previewWord, setPreviewWord] = useState<Word | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('cartoon');

  const handleTemplateChange = (template: CardTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
  };
  
  const currentLibrary = libraries.find(lib => lib.id === selectedLibraryId);
  const allSelected = currentLibrary && selectedWords.size === currentLibrary.words.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-32 lg:pb-6">
        {/* 左侧：单词库选择 + 模板选择 */}
        <div className="w-full lg:w-1/3 space-y-4">
          {/* 单词库选择 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-purple-600 mb-4 flex items-center gap-2">
              <span>📚</span>
              <span>选择单词库</span>
            </h2>

            <div className="space-y-2">
              {libraries.map((library) => (
                <button
                  key={library.id}
                  onClick={() => onSelectLibrary(library.id)}
                  className={`w-full p-3 rounded-xl transition-all text-left ${
                    selectedLibraryId === library.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{library.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{library.name}</div>
                      <div className="text-xs opacity-80">{library.count}个单词</div>
                    </div>
                    {selectedLibraryId === library.id && (
                      <div className="text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 模板选择 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span>🎭</span>
              <span>选择模板</span>
            </h2>

            <div className="space-y-2">
              {CARD_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`w-full p-3 rounded-xl transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs opacity-80">{template.description}</div>
                    </div>
                    {selectedTemplate === template.id && (
                      <div className="text-lg">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：单词卡片预览 */}
        <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-lg p-6 h-full overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
              <span>✨</span>
              <span>选择单词卡片</span>
            </h2>
            {currentLibrary && (
              <button
                onClick={onToggleAll}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  allSelected
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-white text-pink-600 border-2 border-pink-500 hover:bg-pink-50'
                }`}
              >
                {allSelected ? '取消全选' : selectedWords.size > 0 ? `已选 ${selectedWords.size}` : '全选'}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {!currentLibrary ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <p>请先选择一个单词库</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                {currentLibrary.words.map((word) => {
                  const isSelected = selectedWords.has(word.id);
                  
                  return (
                    <div
                      key={word.id}
                      className={`relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
                        isSelected ? 'border-pink-400' : 'border-transparent'
                      }`}
                    >
                      {/* 选择框 - 提高z-index防止被头像遮挡 */}
                      <div
                        onClick={() => onToggleWord(word.id)}
                        className="absolute top-2 left-2 z-20"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                            isSelected
                              ? 'bg-pink-500 border-pink-500'
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
                        className="aspect-square bg-gradient-to-br from-yellow-100 to-pink-100 flex items-center justify-center relative overflow-hidden"
                      >
                        {/* 背景图片和头像 - 头像始终在上层 */}
                        {(() => {
                          return (
                            <>
                              {/* 背景图片 */}
                              {(() => {
                                const imageUrl = getCardImageUrl(word, selectedTemplate);
                                if (imageUrl) {
                                  return (
                                    <div className="absolute inset-0" style={{ zIndex: 0 }}>
                                      <Image
                                        src={imageUrl}
                                        alt={word.english}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  );
                                }
                                return <div className="text-4xl" style={{ zIndex: 0 }}>🎨</div>;
                              })()}
                              
                              {/* 真实头像预览 - 按实际效果显示 */}
                              {photoPreview && (() => {
                                const position = wordPositions[word.id] || { x: word.facePosition.x, y: word.facePosition.y };
                                const rotation = wordRotations?.[word.id] ?? (word.facePosition.rotation || 0);
                                
                                return (
                                  <div 
                                    className="absolute overflow-hidden"
                                    style={{
                                      left: `${position.x}%`,
                                      top: `${position.y}%`,
                                      width: `${word.facePosition.width}%`,
                                      aspectRatio: '1',
                                      transform: `rotate(${rotation}deg)`,
                                      transformOrigin: 'center center',
                                      zIndex: 10, // 头像始终在上层
                                    }}
                                  >
                                    <Image
                                      src={photoPreview}
                                      alt="宝宝"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                );
                              })()}
                            </>
                          );
                        })()}
                      </div>

                      {/* 单词信息 */}
                      <div className="p-2">
                        <div className="font-bold text-center text-sm mb-1">
                          {word.english}
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          {word.chinese}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* 固定底部按钮 - 移动端 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden z-30">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            ← 上一步
          </button>
          <button
            onClick={onNext}
            disabled={selectedWords.size === 0}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              selectedWords.size > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedWords.size > 0
              ? `下一步：选择尺寸 (已选${selectedWords.size}张) →`
              : '请选择至少一个单词'}
          </button>
        </div>
      </div>

      {/* 桌面端按钮 */}
      <div className="hidden lg:block mt-4 space-y-2">
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
        >
          ← 上一步
        </button>
        <button
          onClick={onNext}
          disabled={selectedWords.size === 0}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            selectedWords.size > 0
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selectedWords.size > 0
            ? `下一步：选择尺寸 (已选${selectedWords.size}张) →`
            : '请选择至少一个单词'}
        </button>
      </div>

      {/* 预览弹窗 - 使用可拖动组件 */}
      {previewWord && (
        <DraggableCardPreview
          word={previewWord}
          photoPreview={photoPreview}
          currentPosition={wordPositions[previewWord.id]}
          currentWidth={wordSizes?.[previewWord.id]}
          selectedTemplate={selectedTemplate}
          onClose={() => setPreviewWord(null)}
          onPositionChange={(x, y) => {
            onUpdateWordPosition(previewWord.id, x, y);
          }}
          onSizeChange={(width) => {
            onUpdateWordSize?.(previewWord.id, width);
          }}
          onRotationChange={(rotation) => {
            onUpdateWordRotation?.(previewWord.id, rotation);
          }}
        />
      )}
    </div>
  );
}

