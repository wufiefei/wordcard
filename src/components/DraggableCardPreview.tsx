'use client';

import { Word, CardTemplate } from '@/types/wordcard';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface DraggableCardPreviewProps {
  word: Word;
  photoPreview: string | null;
  currentPosition?: { x: number; y: number };
  currentWidth?: number;
  selectedTemplate: CardTemplate;
  onClose: () => void;
  onPositionChange?: (x: number, y: number) => void;
  onSizeChange?: (width: number) => void;
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

export default function DraggableCardPreview({
  word,
  photoPreview,
  currentPosition,
  currentWidth,
  selectedTemplate,
  onClose,
  onPositionChange,
  onSizeChange,
}: DraggableCardPreviewProps) {
  const [position, setPosition] = useState({
    x: currentPosition?.x ?? word.facePosition.x,
    y: currentPosition?.y ?? word.facePosition.y,
  });
  const [avatarWidth, setAvatarWidth] = useState(currentWidth ?? word.facePosition.width);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showCorners, setShowCorners] = useState(false);
  const [activeCorner, setActiveCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ 
    x: number; 
    y: number; 
    initialWidth: number;
    initialPosition: { x: number; y: number };
    corner: 'tl' | 'tr' | 'bl' | 'br';
  } | null>(null);

  // 拖动头像位置
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-corner')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    if (isDragging) {
      // 拖动位置
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, x));
      const clampedY = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, y));

      setPosition({ x: clampedX, y: clampedY });
      if (onPositionChange) {
        onPositionChange(clampedX, clampedY);
      }
    } else if (isResizing && resizeStartRef.current) {
      // 缩放大小 - 优化算法，使其更跟随鼠标
      const corner = resizeStartRef.current.corner;
      const initialPos = resizeStartRef.current.initialPosition;
      
      // 计算鼠标相对于卡片中心的距离
      const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
      
      // 计算从中心到鼠标的距离
      const distX = Math.abs(mouseXPercent - initialPos.x);
      const distY = Math.abs(mouseYPercent - initialPos.y);
      const dist = Math.max(distX, distY) * 2; // *2 因为width是从中心到边缘的距离
      
      // 限制大小范围，并确保不超出边界
      let newWidth = Math.max(10, Math.min(80, dist));
      
      // 确保头像不会超出卡片边界
      const maxWidthX = Math.min(initialPos.x * 2, (100 - initialPos.x) * 2);
      const maxWidthY = Math.min(initialPos.y * 2, (100 - initialPos.y) * 2);
      const maxWidth = Math.min(maxWidthX, maxWidthY);
      newWidth = Math.min(newWidth, maxWidth);
      
      setAvatarWidth(newWidth);
      if (onSizeChange) {
        onSizeChange(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveCorner(null);
    resizeStartRef.current = null;
  };

  // 点击头像显示/隐藏四个角
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCorners(!showCorners);
  };

  // 开始缩放
  const handleResizeStart = (corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveCorner(corner);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialWidth: avatarWidth,
      initialPosition: { ...position },
      corner,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-corner')) return;
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

    const clampedX = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, x));
    const clampedY = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, y));

    setPosition({ x: clampedX, y: clampedY });
    if (onPositionChange) {
      onPositionChange(clampedX, clampedY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (onPositionChange) {
      onPositionChange(position.x, position.y);
    }
    if (onSizeChange) {
      onSizeChange(avatarWidth);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          {/* 整体卡片（图片 + 文字） */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Square image area */}
            <div
              ref={cardRef}
              className="aspect-square bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 relative select-none"
            >
              {/* Background Image */}
              {(() => {
                const imageUrl = getCardImageUrl(word, selectedTemplate);
                if (imageUrl) {
                  return (
                    <Image
                      src={imageUrl}
                      alt={word.english}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  );
                }
                return (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🎨</div>
                  </div>
                );
              })()}

              {/* Draggable avatar */}
              {photoPreview && (
                <div
                  className="absolute overflow-hidden"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    width: `${avatarWidth}%`,
                    aspectRatio: '1',
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={handleAvatarClick}
                >
                  <Image
                    src={photoPreview}
                    alt="宝宝照片"
                    fill
                    className="object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* 四个缩放角 */}
                  {showCorners && (
                    <>
                      {/* 左上角 */}
                      <div
                        className="resize-corner absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-10 hover:w-6 hover:h-6 hover:bg-blue-600 transition-all"
                        onMouseDown={handleResizeStart('tl')}
                      />
                      {/* 右上角 */}
                      <div
                        className="resize-corner absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg z-10 hover:w-6 hover:h-6 hover:bg-blue-600 transition-all"
                        onMouseDown={handleResizeStart('tr')}
                      />
                      {/* 左下角 */}
                      <div
                        className="resize-corner absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-lg z-10 hover:w-6 hover:h-6 hover:bg-blue-600 transition-all"
                        onMouseDown={handleResizeStart('bl')}
                      />
                      {/* 右下角 */}
                      <div
                        className="resize-corner absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-10 hover:w-6 hover:h-6 hover:bg-blue-600 transition-all"
                        onMouseDown={handleResizeStart('br')}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Text information - inside the card */}
            <div className="p-4 bg-white text-center">
              <div className="text-2xl font-bold mb-1 text-gray-800">
                {word.english}
              </div>
              <div className="text-lg text-gray-600 font-medium">
                {word.chinese}
              </div>
            </div>
          </div>

          {/* 操作提示 */}
          <div className="mt-4 text-center text-xs text-gray-500">
            💡 按住头像可以拖动位置，点击头像显示四个角，拖动角可以缩放大小
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg font-medium text-sm"
            >
              保存位置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
