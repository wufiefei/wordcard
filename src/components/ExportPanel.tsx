'use client';

interface ExportPanelProps {
  selectedCount: number;
  onExportPDF: () => void;
  onExportImages: () => void;
  onPreview: () => void;
}

export default function ExportPanel({
  selectedCount,
  onExportPDF,
  onExportImages,
  onPreview,
}: ExportPanelProps) {
  const isDisabled = selectedCount === 0;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-orange-600 mb-4 flex items-center gap-2">
        <span>🎁</span>
        <span>生成和导出</span>
      </h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-700 bg-orange-50 p-3 rounded-xl">
          <span className="text-2xl">📊</span>
          <div>
            <div className="font-medium">
              已选择 <span className="text-orange-600 text-lg">{selectedCount}</span> 张卡片
            </div>
            <div className="text-sm text-gray-500">
              {selectedCount > 0
                ? `大约需要 ${Math.ceil(selectedCount / 6)} 页A4纸`
                : '请选择至少一张卡片'}
            </div>
          </div>
        </div>

        <button
          onClick={onPreview}
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
          }`}
        >
          👀 预览排版效果
        </button>

        <button
          onClick={onExportPDF}
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-md hover:shadow-lg'
          }`}
        >
          📄 导出为PDF
        </button>

        <button
          onClick={onExportImages}
          disabled={isDisabled}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            isDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500 shadow-md hover:shadow-lg'
          }`}
        >
          🖼️ 导出单张图片
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 提示：</p>
          <p>• PDF适合打印实体卡片</p>
          <p>• 单张图片适合电子设备展示</p>
          <p>• 建议使用300DPI打印获得最佳效果</p>
        </div>
      </div>
    </div>
  );
}

