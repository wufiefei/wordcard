'use client';

import { CARD_SIZES } from '@/types/wordcard';

interface CardSizeSelectorProps {
  selectedSize: string;
  onSelectSize: (sizeId: string) => void;
}

export default function CardSizeSelector({
  selectedSize,
  onSelectSize,
}: CardSizeSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-blue-600 mb-3 flex items-center gap-2">
        <span>📐</span>
        <span>选择卡片尺寸</span>
      </h2>
      
      <div className="space-y-2">
        {CARD_SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelectSize(size.id)}
            className={`w-full p-4 rounded-xl transition-all text-left ${
              selectedSize === size.id
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-md ring-4 ring-blue-200'
                : 'bg-white hover:bg-blue-50 text-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">{size.name}</span>
              <span className={`text-sm px-3 py-1 rounded-full ${
                selectedSize === size.id
                  ? 'bg-white/30'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {size.cardsPerSheet}张/页
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="opacity-75">布局：</span>
                <span className="font-medium ml-1">{size.layout}</span>
              </div>
              <div>
                <span className="opacity-75">尺寸：</span>
                <span className="font-medium ml-1">{size.cutSize}mm</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-75">推荐：</span>
                <span className="font-medium ml-1">{size.scenario}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

