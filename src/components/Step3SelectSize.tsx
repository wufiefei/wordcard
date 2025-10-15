'use client';

import { CARD_SIZES } from '@/types/wordcard';
import { useState } from 'react';

interface Step3SelectSizeProps {
  selectedSize: string;
  selectedWordsCount: number;
  onSelectSize: (sizeId: string) => void;
  onBack: () => void;
  onExportPDF: () => void;
  onExportImages: () => void;
}

export default function Step3SelectSize({
  selectedSize,
  selectedWordsCount,
  onSelectSize,
  onBack,
  onExportPDF,
  onExportImages,
}: Step3SelectSizeProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  
  const currentSizeConfig = CARD_SIZES.find(s => s.id === selectedSize);
  const totalPages = currentSizeConfig 
    ? Math.ceil(selectedWordsCount / currentSizeConfig.cardsPerSheet)
    : 1;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pb-44 lg:pb-6">
        {/* 左侧：尺寸选择 */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span>📐</span>
              <span>选择卡片尺寸</span>
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {CARD_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => onSelectSize(size.id)}
                  className={`w-full p-3 rounded-xl transition-all text-left ${
                    selectedSize === size.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-bold">{size.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedSize === size.id
                        ? 'bg-white/30'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {size.cardsPerSheet}张/页
                    </span>
                  </div>
                  <div className="text-xs opacity-90">
                    <div>{size.cutSize}mm · {size.scenario}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* 统计信息 */}
            <div className="mt-4 p-3 bg-orange-50 rounded-xl text-sm">
              <div className="font-medium text-orange-700 mb-1">
                📊 已选择 <span className="text-lg">{selectedWordsCount}</span> 张卡片
              </div>
              <div className="text-xs text-gray-600">
                大约需要 <span className="font-bold text-orange-600">{totalPages}</span> 页A4纸
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-purple-50 rounded-xl p-4 text-xs text-gray-600">
            <p className="font-medium text-purple-700 mb-2">💡 打印提示</p>
            <ul className="space-y-1">
              <li>• PDF适合打印实体卡片</li>
              <li>• 多张图片适合电子设备展示</li>
              <li>• 建议使用300DPI打印获得最佳效果</li>
            </ul>
          </div>
        </div>

        {/* 右侧：A4排版预览 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                <span>📄</span>
                <span>排版预览</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* 缩放控制 */}
                <button
                  onClick={handleZoomOut}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                  title="缩小"
                >
                  −
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs"
                  title="重置"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                  title="放大"
                >
                  +
                </button>
                
                {/* 翻页控制 */}
                {totalPages > 1 && (
                  <>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* A4纸张预览 - 可滚动容器 */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100 rounded-xl">
              <div 
                className="relative bg-white shadow-2xl transition-transform duration-200"
                style={{ 
                  width: `${210 * zoom}mm`,
                  aspectRatio: '210 / 297',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* A4纸张背景 */}
                <div className="absolute inset-0 bg-white" />

                {/* 卡片网格 */}
                {currentSizeConfig && (
                  <div className="absolute inset-0 grid gap-0" style={{
                    gridTemplateColumns: `repeat(${currentSizeConfig.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${currentSizeConfig.rows}, 1fr)`,
                    padding: '5mm',
                  }}>
                    {Array.from({ length: currentSizeConfig.cardsPerSheet }).map((_, idx) => {
                      const globalIndex = (currentPage - 1) * currentSizeConfig.cardsPerSheet + idx;
                      const hasCard = globalIndex < selectedWordsCount;
                      
                      return (
                        <div
                          key={idx}
                          className={`relative ${
                            hasCard 
                              ? 'bg-gradient-to-br from-yellow-100 to-pink-100' 
                              : 'bg-gray-100'
                          }`}
                          style={{ margin: '1mm' }}
                        >
                          {hasCard ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                              <div className="text-2xl mb-1">🎨</div>
                              <div className="text-xs font-bold text-gray-700">
                                卡片 {globalIndex + 1}
                              </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                              空白
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 页面标识 */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                  第 {currentPage} 页
                </div>
              </div>
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
            onClick={onExportPDF}
            className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg transition-all"
          >
            📄 导出为PDF
          </button>
          <button
            onClick={onExportImages}
            className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all"
          >
            🖼️ 导出多张图片
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
          onClick={onExportPDF}
          className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
        >
          📄 导出为PDF
        </button>
        <button
          onClick={onExportImages}
          className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
        >
          🖼️ 导出多张图片
        </button>
      </div>
    </div>
  );
}
