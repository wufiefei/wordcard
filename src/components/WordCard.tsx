'use client';

import { Word, CardTemplate, CardSizeType } from '@/types/wordcard';
import Image from 'next/image';

interface WordCardProps {
  word: Word;
  photoPreview: string | null;
  selectedTemplate: CardTemplate;
  wordPosition?: { x: number; y: number };
  cardSize: CardSizeType;
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

// 根据卡片尺寸获取精确的布局参数
function getCardLayout(sizeId: string) {
  switch (sizeId) {
    case 'extra-large': // 超大卡 148×105mm (横版)
      return {
        imageSize: '143mm',
        padding: '8mm',
        imageGap: '8mm',
        textGap: '3mm',
        englishSize: '50pt',
        chineseSize: '30pt',
        direction: 'vertical' as const, // 图片上，文字下
      };
    case 'large': // 大卡 100×138mm (竖版)
      return {
        imageSize: '70mm',
        paddingV: '12mm',
        paddingH: '15mm',
        imageGap: '7mm',
        textGap: '2.5mm',
        englishSize: '16pt',
        chineseSize: '12pt',
        direction: 'vertical' as const, // 图片上，文字下
      };
    case 'standard': // 标准卡 95×68mm (横版)
      return {
        imageSize: '50mm',
        paddingV: '8mm',
        paddingH: '10mm',
        imageGap: '6mm',
        textGap: '2.5mm',
        englishSize: '14pt',
        chineseSize: '10pt',
        direction: 'horizontal' as const, // 图片左，文字右
      };
    case 'small': // 中卡 95×68mm (横版)
      return {
        imageSize: '50mm',
        paddingV: '8mm',
        paddingH: '10mm',
        imageGap: '6mm',
        textGap: '2.5mm',
        englishSize: '14pt',
        chineseSize: '10pt',
        direction: 'horizontal' as const, // 图片左，文字右
      };
    case 'square': // 方形卡 64×64mm
      return {
        imageSize: '40mm',
        padding: '5mm',
        imageGap: '5mm',
        textGap: '2mm',
        englishSize: '12pt',
        chineseSize: '9pt',
        direction: 'vertical' as const, // 图片居中，文字下
      };
    case 'mini': // 迷你卡 95×55mm (横版)
      return {
        imageSize: '40mm',
        paddingV: '4mm',
        paddingH: '8mm',
        imageGap: '4mm',
        textGap: '2mm',
        englishSize: '11pt',
        chineseSize: '8pt',
        direction: 'horizontal' as const, // 图片左，文字右
      };
    default:
      return {
        imageSize: '50mm',
        paddingV: '8mm',
        paddingH: '10mm',
        imageGap: '6mm',
        textGap: '2.5mm',
        englishSize: '14pt',
        chineseSize: '10pt',
        direction: 'horizontal' as const,
      };
  }
}

export default function WordCard({
  word,
  photoPreview,
  selectedTemplate,
  wordPosition,
  cardSize,
}: WordCardProps) {
  const position = wordPosition || { x: word.facePosition.x, y: word.facePosition.y };
  const imageUrl = getCardImageUrl(word, selectedTemplate);
  const layout = getCardLayout(cardSize.id);

  // 计算内边距
  const paddingStyle = 'padding' in layout
    ? { padding: layout.padding }
    : { paddingTop: layout.paddingV, paddingBottom: layout.paddingV, paddingLeft: layout.paddingH, paddingRight: layout.paddingH };

  if (layout.direction === 'horizontal') {
    // 横向布局：图片左，文字右
    return (
      <div 
        className="word-card w-full h-full bg-white flex items-center border-2 border-black"
        style={paddingStyle}
      >
        {/* 图片区域 - 左侧 */}
        <div 
          className="relative bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex-shrink-0"
          style={{
            width: layout.imageSize,
            height: layout.imageSize,
          }}
        >
          {/* 背景图片 */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={word.english}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              🎨
            </div>
          )}

          {/* 宝宝头像 */}
          {photoPreview && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${word.facePosition.width}%`,
                aspectRatio: '1',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Image
                src={photoPreview}
                alt="宝宝"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* 文字区域 - 右侧 */}
        <div 
          className="flex-1 flex flex-col justify-center items-center"
          style={{ marginLeft: layout.imageGap }}
        >
          <div 
            className="text-center font-bold text-gray-800"
            style={{
              fontSize: layout.englishSize,
              lineHeight: '1.2',
              fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            }}
          >
            {word.english}
          </div>
          <div 
            className="text-center text-gray-600 font-medium"
            style={{
              marginTop: layout.textGap,
              fontSize: layout.chineseSize,
              lineHeight: '1.2',
              fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
            }}
          >
            {word.chinese}
          </div>
        </div>
      </div>
    );
  } else {
    // 纵向布局：图片上，文字下
    return (
      <div 
        className="word-card w-full h-full bg-white flex flex-col items-center border-2 border-black rounded-lg"
        style={paddingStyle}
      >
        {/* 图片区域 - 上方 */}
        <div 
          className="relative bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex-shrink-0"
          style={{
            width: layout.imageSize,
            height: layout.imageSize,
          }}
        >
          {/* 背景图片 */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={word.english}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              🎨
            </div>
          )}

          {/* 宝宝头像 */}
          {photoPreview && (
            <div
              className="absolute overflow-hidden"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${word.facePosition.width}%`,
                aspectRatio: '1',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Image
                src={photoPreview}
                alt="宝宝"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* 文字区域 - 下方 */}
        <div 
          className="flex-1 flex flex-col justify-center items-center"
          style={{ marginTop: layout.imageGap }}
        >
          <div 
            className="text-center font-bold text-gray-800"
            style={{
              fontSize: layout.englishSize,
              lineHeight: '1.2',
              fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            }}
          >
            {word.english}
          </div>
          <div 
            className="text-center text-gray-600 font-medium"
            style={{
              marginTop: layout.textGap,
              fontSize: layout.chineseSize,
              lineHeight: '1.2',
              fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
            }}
          >
            {word.chinese}
          </div>
        </div>
      </div>
    );
  }
}
